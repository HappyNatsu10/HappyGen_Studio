"""
OmniGen AI Studio - Unified Local Inference Server
Optimized for 4GB VRAM (PonyXL / SDXL + SDXL Lightning + NEGATIVE_HANDS + Multi-LoRA)
"""

import os
import sys
import io
import json
import time
import base64
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

import torch
from safetensors.torch import load_file
from safetensors import safe_open
from diffusers import StableDiffusionXLPipeline, EulerAncestralDiscreteScheduler

# Configuration & Paths
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODELS_DIR = os.path.join(ROOT_DIR, "Models")
BASE_MODEL_NAME = "crucibleRINGPonyxl_v28.safetensors"
BASE_MODEL_PATH = os.path.join(MODELS_DIR, BASE_MODEL_NAME)
LIGHTNING_PATH = os.path.join(MODELS_DIR, "sdxl_lightning_4step_lora.safetensors")
NEGATIVE_HANDS_PATH = os.path.join(MODELS_DIR, "NEGATIVE_HANDS.safetensors")

# State
pipe_lock = threading.Lock()
active_pipeline = None
active_loras_signature = None

def is_sdxl_compatible(fpath):
    """Verify if a safetensors LoRA matches SDXL architecture"""
    fname = os.path.basename(fpath).lower()
    if "negative_hands" in fname or "lightning" in fname:
        return True
    try:
        with safe_open(fpath, framework="pt") as f:
            meta = f.metadata() or {}
            base_ver = str(meta.get("ss_base_model_version", "")).lower()
            if "sd_v1" in base_ver or "v1-5" in base_ver or "sd1" in base_ver:
                return False
            for k in f.keys():
                if "lora" in k:
                    shape = f.get_slice(k).get_shape()
                    if 768 in shape or 320 in shape:
                        return False
            return True
    except Exception:
        return False

def get_pipeline():
    """Initialize or return cached base pipeline optimized for 4GB VRAM"""
    global active_pipeline
    if active_pipeline is not None:
        return active_pipeline

    print(f"[ENGINE] Loading Crucible RING PonyXL base checkpoint: {BASE_MODEL_PATH}")
    pipe = StableDiffusionXLPipeline.from_single_file(
        BASE_MODEL_PATH,
        torch_dtype=torch.float16,
        use_safetensors=True
    )
    pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)

    # 1. SDXL Lightning 4-Step Acceleration
    if os.path.exists(LIGHTNING_PATH):
        try:
            print("[ACCEL] Fusing SDXL Lightning 4-Step LoRA...")
            pipe.load_lora_weights(MODELS_DIR, weight_name=os.path.basename(LIGHTNING_PATH))
            pipe.fuse_lora()
            pipe.unload_lora_weights()
            print("[ACCEL] SDXL Lightning successfully fused into UNet!")
        except Exception as e:
            print(f"[WARN] Lightning fusion note: {e}")

    # 2. NEGATIVE_HANDS Dual-CLIP Textual Inversion
    if os.path.exists(NEGATIVE_HANDS_PATH):
        try:
            sd = load_file(NEGATIVE_HANDS_PATH)
            if "clip_l" in sd and "clip_g" in sd:
                pipe.load_textual_inversion(sd["clip_l"], token="negative_hands", text_encoder=pipe.text_encoder, tokenizer=pipe.tokenizer)
                pipe.load_textual_inversion(sd["clip_g"], token="negative_hands", text_encoder=pipe.text_encoder_2, tokenizer=pipe.tokenizer_2)
                print("[ANATOMY] NEGATIVE_HANDS Dual-CLIP embeddings active in token 'negative_hands'!")
        except Exception as e:
            print(f"[WARN] NEGATIVE_HANDS load note: {e}")

    # 3. 4GB VRAM Memory Optimizations
    pipe.enable_sequential_cpu_offload()
    pipe.vae.enable_slicing()
    pipe.vae.enable_tiling()

    print("[READY] OmniGen Pipeline initialized with Sequential CPU Offload & VAE Tiling!")
    active_pipeline = pipe
    return active_pipeline

def apply_loras(pipe, loras_list):
    """Apply verified SDXL LoRAs safely"""
    global active_loras_signature
    if not loras_list:
        if active_loras_signature is not None:
            try:
                pipe.unfuse_lora()
                pipe.unload_lora_weights()
            except Exception:
                pass
            active_loras_signature = None
        return

    normalized = []
    for item in loras_list:
        if isinstance(item, str):
            normalized.append({"name": item, "weight": 0.85})
        elif isinstance(item, dict) and item.get("name"):
            normalized.append({"name": item["name"], "weight": float(item.get("weight", 0.85))})

    current_sig = "|".join([f"{x['name']}:{x['weight']:.2f}" for x in normalized if x['name'] != BASE_MODEL_NAME])
    if current_sig == active_loras_signature:
        return

    try:
        try:
            pipe.unfuse_lora()
            pipe.unload_lora_weights()
        except Exception:
            pass

        fused_count = 0
        for item in normalized:
            fname = item["name"]
            weight = item["weight"]
            fpath = os.path.join(MODELS_DIR, fname)
            if fname == BASE_MODEL_NAME or not os.path.exists(fpath):
                continue
            if not is_sdxl_compatible(fpath):
                print(f"[FILTER] '{fname}' is SD 1.5 architecture. Skipped to protect SDXL UNet.")
                continue

            try:
                pipe.load_lora_weights(MODELS_DIR, weight_name=fname)
                try:
                    pipe.fuse_lora(lora_scale=weight)
                except Exception:
                    pass
                fused_count += 1
                print(f"[LORA] Merged '{fname}' with scale {weight}")
            except Exception as le:
                print(f"[WARN] Skipped {fname}: {le}")

        active_loras_signature = current_sig if fused_count > 0 else None
    except Exception as e:
        print(f"[WARN] LoRA merge note: {e}")
        active_loras_signature = None

def generate_image_core(prompt, negative_prompt, width, height, seed, loras_list=None, steps=20, guidance_scale=6.5):
    """Core image generation workflow"""
    with pipe_lock:
        pipe = get_pipeline()
        if loras_list:
            apply_loras(pipe, loras_list)

        # 4GB VRAM-Safe Dimension Clamping (portrait: 512x768, landscape: 768x512, square: 576x576)
        target_aspect = (width / height) if height > 0 else 1.0
        if target_aspect > 1.3:
            render_w, render_h = 768, 512
        elif target_aspect < 0.8:
            render_w, render_h = 512, 768
        else:
            render_w, render_h = 576, 576

        render_w = (render_w // 8) * 8
        render_h = (render_h // 8) * 8

        # Prompt Triggers
        full_prompt = prompt
        if "score_9" not in prompt:
            full_prompt = f"score_9, score_8_up, score_7_up, source_anime, {prompt}"

        full_neg = negative_prompt or ""
        if "negative_hands" not in full_neg:
            full_neg = f"negative_hands, {full_neg}".strip(", ")
        if "score_4" not in full_neg:
            full_neg = f"score_4, score_5, score_6, source_pony, source_furry, 3d, realistic, {full_neg}"
        if "extra fingers" not in full_neg:
            full_neg = f"{full_neg}, bad hands, malformed hands, extra fingers, missing fingers, fused fingers, mutated hands, bad anatomy, deformed limbs, blurry"

        num_steps = max(4, min(int(steps or 20), 35))
        cfg = float(guidance_scale or 6.5)

        print(f"[RUN] Generating {render_w}x{render_h} | Steps: {num_steps} | CFG: {cfg} | Seed: {seed}")
        t0 = time.time()
        with torch.inference_mode():
            result = pipe(
                prompt=full_prompt,
                negative_prompt=full_neg,
                width=render_w,
                height=render_h,
                num_inference_steps=num_steps,
                guidance_scale=cfg,
                generator=torch.Generator(device="cpu").manual_seed(seed)
            )
        t1 = time.time()
        print(f"[RUN COMPLETE] Generated in {t1 - t0:.2f}s!")

        img = result.images[0]
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{b64_str}"

def get_models_catalog():
    """Return catalog of available models categorized by architecture"""
    models = []
    if not os.path.exists(MODELS_DIR):
        return models
    for fname in os.listdir(MODELS_DIR):
        if fname.endswith(".safetensors"):
            fpath = os.path.join(MODELS_DIR, fname)
            compat = is_sdxl_compatible(fpath)
            models.append({
                "id": fname,
                "name": fname.replace(".safetensors", ""),
                "file": fname,
                "size_mb": round(os.path.getsize(fpath) / (1024 * 1024), 1),
                "is_base": (fname == BASE_MODEL_NAME),
                "is_sdxl": compat,
                "type": "Base Checkpoint" if fname == BASE_MODEL_NAME else ("Embedding" if fname.startswith("NEGATIVE") else ("SDXL LoRA" if compat else "SD 1.5 LoRA"))
            })
    return sorted(models, key=lambda x: (not x["is_base"], not x["is_sdxl"], x["name"]))

class StudioInferenceHandler(BaseHTTPRequestHandler):
    def _send_cors(self, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._send_cors(200)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path in ("/api/models", "/models"):
            self._send_cors(200)
            catalog = get_models_catalog()
            self.wfile.write(json.dumps({
                "status": "ok",
                "count": len(catalog),
                "base_model": BASE_MODEL_NAME,
                "models": catalog,
                "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
            }).encode('utf-8'))
        else:
            self._send_cors(200)
            self.wfile.write(json.dumps({
                "status": "running",
                "base_model": BASE_MODEL_NAME,
                "active_loras": active_loras_signature,
                "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
                "cuda": torch.cuda.is_available()
            }).encode('utf-8'))

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b'{}'
        try:
            body = json.loads(post_data.decode('utf-8'))
        except Exception:
            body = {}

        if parsed.path in ("/sdapi/v1/txt2img", "/api/generate"):
            try:
                b64_image = generate_image_core(
                    prompt=body.get("prompt", "1girl, solo, anime girl, masterpiece"),
                    negative_prompt=body.get("negative_prompt", ""),
                    width=body.get("width", 512),
                    height=body.get("height", 768),
                    seed=body.get("seed", 42),
                    loras_list=body.get("loras", []),
                    steps=body.get("steps", 20),
                    guidance_scale=body.get("cfg_scale") or body.get("guidance_scale", 6.5)
                )
                self._send_cors(200)
                self.wfile.write(json.dumps({
                    "status": "ok",
                    "source": f"Local GPU ({BASE_MODEL_NAME}) + NEGATIVE_HANDS",
                    "images": [b64_image]
                }).encode('utf-8'))
            except Exception as e:
                print(f"[ERROR] Generation error: {e}")
                self._send_cors(500)
                self.wfile.write(json.dumps({"status": "error", "message": str(e), "images": []}).encode('utf-8'))
        else:
            self._send_cors(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

def run(port=8000):
    server = HTTPServer(('', port), StudioInferenceHandler)
    print(f"[ONLINE] OmniGen Local Inference Server running on http://localhost:{port}")
    server.serve_forever()

if __name__ == "__main__":
    run()
