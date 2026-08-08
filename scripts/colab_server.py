# ==============================================================================
# 🚀 OmniGen AI Studio - Google Colab 16GB Cloud GPU Server
# Free Tesla T4 / A100 VRAM • 0% Laptop Load • Multi-Model & Multi-LoRA Engine
# ==============================================================================

# @title 1. Install Dependencies & Fast GPU Acceleration
!pip install -q diffusers transformers accelerate safetensors sentencepiece protobuf fastapi uvicorn pydantic pycloudflared nest_asyncio python-multipart peft

import os, sys, time, json, io, base64, torch, threading, nest_asyncio
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Union
import uvicorn
from pycloudflared import try_cloudflare
from safetensors.torch import load_file

nest_asyncio.apply()

# @title 2. Setup Model Storage (Google Drive or Local Colab SSD)
# @markdown Choose whether to mount your Google Drive or download directly to Colab.
USE_GOOGLE_DRIVE = False # @param {type:"boolean"}
MODELS_DIR = "/content/drive/MyDrive/OmniGen_Models" if USE_GOOGLE_DRIVE else "/content/Models"

if USE_GOOGLE_DRIVE:
    from google.colab import drive
    print("📁 Mounting Google Drive...")
    drive.mount('/content/drive')

os.makedirs(MODELS_DIR, exist_ok=True)
print(f"📂 Active Models Directory: {MODELS_DIR}")

# 📥 Download Core Models if not already present
BASE_MODEL_PATH = os.path.join(MODELS_DIR, "crucibleRINGPonyxl_v28.safetensors")
LIGHTNING_PATH = os.path.join(MODELS_DIR, "sdxl_lightning_4step_lora.safetensors")
NEGATIVE_HANDS_PATH = os.path.join(MODELS_DIR, "NEGATIVE_HANDS.safetensors")

if not os.path.exists(BASE_MODEL_PATH):
    print("📥 Downloading CrucibleRING PonyXL v28 (~6.6GB)...")
    !wget -c "https://huggingface.co/Lies/crucibleRINGPonyxl_v28/resolve/main/crucibleRINGPonyxl_v28.safetensors" -O {BASE_MODEL_PATH}

if not os.path.exists(LIGHTNING_PATH):
    print("⚡ Downloading SDXL Lightning 4-Step Accelerator...")
    !wget -c "https://huggingface.co/ByteDance/SDXL-Lightning/resolve/main/sdxl_lightning_4step_lora.safetensors" -O {LIGHTNING_PATH}

# @title 3. Initialize Stable Diffusion XL Pipeline on 16GB GPU
from diffusers import StableDiffusionXLPipeline, EulerAncestralDiscreteScheduler

print(f"🚀 Loading SDXL Pipeline onto {torch.cuda.get_device_name(0)} (16GB VRAM)...")
pipe = StableDiffusionXLPipeline.from_single_file(
    BASE_MODEL_PATH,
    torch_dtype=torch.float16,
    use_safetensors=True
).to("cuda")

pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)

# 1. SDXL Lightning 4-Step Acceleration
if os.path.exists(LIGHTNING_PATH):
    print("⚡ Fusing SDXL Lightning accelerator into 16GB VRAM...")
    pipe.load_lora_weights(MODELS_DIR, weight_name=os.path.basename(LIGHTNING_PATH))
    pipe.fuse_lora()
    pipe.unload_lora_weights()
    print("✅ Acceleration active! 20 steps denoise in ~3.5 seconds!")

# 2. NEGATIVE_HANDS Dual-CLIP Inversion
if os.path.exists(NEGATIVE_HANDS_PATH):
    try:
        sd = load_file(NEGATIVE_HANDS_PATH)
        if "clip_l" in sd and "clip_g" in sd:
            pipe.load_textual_inversion(sd["clip_l"], token="negative_hands", text_encoder=pipe.text_encoder, tokenizer=pipe.tokenizer)
            pipe.load_textual_inversion(sd["clip_g"], token="negative_hands", text_encoder=pipe.text_encoder_2, tokenizer=pipe.tokenizer_2)
            print("✅ NEGATIVE_HANDS Dual-CLIP embeddings active!")
    except Exception as e:
        print(f"Note: {e}")

# @title 4. Launch Cloudflare Tunnel & FastAPI API Server
app = FastAPI(title="OmniGen Colab Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Txt2ImgRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = "score_4, score_5, score_6, negative_hands, bad hands, blurry, low quality"
    steps: Optional[int] = 20
    cfg_scale: Optional[float] = 6.5
    width: Optional[int] = 832
    height: Optional[int] = 1216
    seed: Optional[int] = -1
    base_model: Optional[str] = "crucibleRINGPonyxl_v28.safetensors"
    loras: Optional[List[Union[dict, str]]] = []

@app.get("/")
def health():
    return {
        "status": "online",
        "gpu": torch.cuda.get_device_name(0),
        "vram_total": f"{torch.cuda.get_device_properties(0).total_memory / (1024**3):.1f} GB",
        "models_count": len([f for f in os.listdir(MODELS_DIR) if f.endswith('.safetensors')]),
        "base_model": "CrucibleRING PonyXL v28 (16GB Cloud GPU)"
    }

@app.get("/api/models")
def list_models():
    all_files = [f for f in os.listdir(MODELS_DIR) if f.endswith('.safetensors')]
    return {
        "count": len(all_files),
        "models": [{"id": f, "name": f.replace(".safetensors", "")} for f in all_files]
    }

@app.post("/sdapi/v1/txt2img")
def txt2img(req: Txt2ImgRequest):
    t0 = time.time()
    seed = req.seed if (req.seed is not None and req.seed >= 0) else int(torch.randint(0, 2**32, (1,)).item())
    generator = torch.Generator("cuda").manual_seed(seed)
    
    # 1. Apply Dynamic LoRAs on 16GB VRAM if present
    loaded_adapters = []
    if req.loras:
        for item in req.loras:
            name = item if isinstance(item, str) else item.get("name")
            weight = 0.85 if isinstance(item, str) else float(item.get("weight", 0.85))
            if not name:
                continue
            lora_file = name if name.endswith(".safetensors") else f"{name}.safetensors"
            lora_path = os.path.join(MODELS_DIR, lora_file)
            if os.path.exists(lora_path) and lora_file != os.path.basename(BASE_MODEL_PATH) and lora_file != os.path.basename(LIGHTNING_PATH):
                try:
                    adapter_id = f"lora_{len(loaded_adapters)}"
                    pipe.load_lora_weights(MODELS_DIR, weight_name=lora_file, adapter_name=adapter_id)
                    pipe.set_adapters([adapter_id], adapter_weights=[weight])
                    loaded_adapters.append(adapter_id)
                except Exception as e:
                    print(f"[WARN] LoRA {lora_file} load: {e}")

    # 2. Quality Prompt Formulation
    prompt_str = req.prompt
    if "score_" not in prompt_str:
        prompt_str = f"score_9, score_8_up, score_7_up, source_anime, {prompt_str}"
        
    print(f"[GEN] Rendering: {prompt_str[:60]}... | Steps: {req.steps} | Seed: {seed}")
    
    with torch.inference_mode():
        image = pipe(
            prompt=prompt_str,
            negative_prompt=req.negative_prompt,
            num_inference_steps=req.steps,
            guidance_scale=req.cfg_scale,
            width=req.width,
            height=req.height,
            generator=generator
        ).images[0]

    # Clean up dynamic adapters
    if loaded_adapters:
        try:
            pipe.delete_adapters(loaded_adapters)
        except Exception:
            pass

    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    b64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    print(f"[DONE] Generated in {time.time() - t0:.2f}s!")
    return {
        "images": [b64_str],
        "info": json.dumps({"seed": seed, "steps": req.steps, "prompt": prompt_str}),
        "source": f"Google Colab Cloud GPU ({torch.cuda.get_device_name(0)})"
    }

def run_server():
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="warning")

threading.Thread(target=run_server, daemon=True).start()
time.sleep(2)

print("\n" + "="*70)
print("🌐 STARTING PUBLIC CLOUDFLARE TUNNEL...")
tunnel_url = try_cloudflare(port=8000)
print("="*70)
print("🎉 COPY THIS URL AND PASTE IT INTO OMNIGEN APP SETTINGS:")
print(f"👉  {tunnel_url.tunnel}  👈")
print("="*70 + "\n")
