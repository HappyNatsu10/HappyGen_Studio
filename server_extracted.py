# Cell 1: Install Dependencies
pass # !pip install -q diffusers transformers accelerate safetensors sentencepiece protobuf fastapi uvicorn pydantic pycloudflared nest_asyncio python-multipart peft open_clip_torch
pass # !pip install -q git+https://github.com/xinntao/BasicSR.git
pass # !pip install -q git+https://github.com/xinntao/Real-ESRGAN.git
pass # !pip install -q gfpgan

# Cell 2: Download Models & SDXL Lightning Accelerator
import os
os.makedirs("/content/Models", exist_ok=True)
os.makedirs("/content/LoRAs", exist_ok=True)
os.makedirs("/content/Embeddings", exist_ok=True)

# Define the path for the desired Civitai base model
BASE_MODEL_PATH = "/content/Models/crucibleRINGPonyxl_v28.safetensors"
LIGHTNING_PATH = "/content/LoRAs/sdxl_lightning_4step_lora.safetensors"

# Import userdata for secrets
from google.colab import userdata

try:
    CIVITAI_API_KEY = userdata.get('CIVITAI_API_KEY')
except Exception:
    CIVITAI_API_KEY = None

def civitai_download_url(model_version_id):
    base_url = f"https://civitai.com/api/download/models/{model_version_id}"
    if CIVITAI_API_KEY:
        return f"{base_url}?token={CIVITAI_API_KEY}"
    return base_url

# Clean up corrupted files
if os.path.exists(BASE_MODEL_PATH) and os.path.getsize(BASE_MODEL_PATH) < 1024 * 1024:
    print(f"⚠️ Found corrupted or incomplete file at {BASE_MODEL_PATH}. Deleting and re-downloading...")
    os.remove(BASE_MODEL_PATH)

if not os.path.exists(BASE_MODEL_PATH):
    print("📥 Downloading CrucibleRING PonyXL v28 (~6.6GB) from Civitai...")
    pass # !wget -c "{civitai_download_url('1979291')}" -O {BASE_MODEL_PATH}
    if os.path.exists(BASE_MODEL_PATH) and os.path.getsize(BASE_MODEL_PATH) < 1024 * 1024:
        print(f"⚠️ Download failed. It might be corrupted. Deleting file.")
        os.remove(BASE_MODEL_PATH)
    else:
        print(f"✅ Base model downloaded successfully.")

if not os.path.exists(LIGHTNING_PATH):
    print("⚡ Downloading SDXL Lightning 4-Step LoRA...")
    pass # !wget -c "https://huggingface.co/ByteDance/SDXL-Lightning/resolve/main/sdxl_lightning_4step_lora.safetensors" -O {LIGHTNING_PATH}

print("✅ Storage ready! Models directory is prepared.")

# Cell 3: Load Model into 16GB Cloud VRAM
import torch
from diffusers import StableDiffusionXLPipeline, StableDiffusionXLImg2ImgPipeline, EulerAncestralDiscreteScheduler

print("🧹 Cleaning up /content/Models from non-base model safetensors files...")
for filename in os.listdir("/content/Models"):
    file_path = os.path.join("/content/Models", filename)
    if filename.endswith(".safetensors") and file_path != BASE_MODEL_PATH:
        print(f"    Deleting file: {file_path}")
        os.remove(file_path)

print(f"🚀 Initializing Pipeline on {torch.cuda.get_device_name(0)}...")
CURRENT_BASE_MODEL_FILE = os.path.basename(BASE_MODEL_PATH)
global pipe
global pipe_img2img

pipe = StableDiffusionXLPipeline.from_single_file(
    BASE_MODEL_PATH,
    torch_dtype=torch.float16,
    use_safetensors=True
).to("cuda")
pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)

pipe_img2img = StableDiffusionXLImg2ImgPipeline(
    vae=pipe.vae,
    text_encoder=pipe.text_encoder,
    text_encoder_2=pipe.text_encoder_2,
    tokenizer=pipe.tokenizer,
    tokenizer_2=pipe.tokenizer_2,
    unet=pipe.unet,
    scheduler=pipe.scheduler,
)

print("✅ Base model loaded successfully and ready for dynamic UI injection.")

# Cell 4: Launch FastAPI Server & Cloudflare Public Tunnel
import io, base64, time, json, threading, nest_asyncio, os, uuid
import numpy as np
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Union
import uvicorn
from pycloudflared import try_cloudflare
import requests
import gc
import subprocess

nest_asyncio.apply()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Lazy-loaded utility models (loaded on first use, unloaded after to save VRAM)
# ============================================================================
_clip_model = None
_clip_preprocess = None
_upscaler = None
_face_restorer = None

tasks = {}
def _bg_runner(task_id, func, *args, **kwargs):
    try:
        res = func(*args, **kwargs)
        tasks[task_id]['status'] = 'completed'
        tasks[task_id]['result'] = res
    except Exception as e:
        tasks[task_id]['status'] = 'failed'
        tasks[task_id]['error'] = str(e)

@app.get("/async/status/{task_id}")
def async_status(task_id: str):
    if task_id not in tasks: return {"status": "not_found"}
    return tasks[task_id]

_tagger_session = None
_tagger_tags = None

def _load_tagger():
    global _tagger_session, _tagger_tags
    if _tagger_session is not None: return
    import subprocess
    import csv
    print("📦 Installing WD14 Tagger dependencies...")
    subprocess.check_call(["pip", "install", "-q", "onnxruntime-gpu", "huggingface_hub"])
    
    from huggingface_hub import hf_hub_download
    import onnxruntime as ort
    
    repo_id = "SmilingWolf/wd-v1-4-moat-tagger-v2"
    print("🔍 Downloading WD14 Tagger Model...")
    model_path = hf_hub_download(repo_id, "model.onnx")
    tags_path = hf_hub_download(repo_id, "selected_tags.csv")
    
    with open(tags_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        next(reader)
        _tagger_tags = [row[1] for row in reader]
        
    _tagger_session = ort.InferenceSession(model_path, providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])

def _unload_tagger():
    global _tagger_session, _tagger_tags
    if _tagger_session is not None:
        del _tagger_session
        _tagger_session = None
        _tagger_tags = None
        gc.collect()
        torch.cuda.empty_cache()

def _load_upscaler():
    global _upscaler
    if _upscaler is not None: return
    from realesrgan import RealESRGANer
    from basicsr.archs.rrdbnet_arch import RRDBNet
    print("🔎 Loading Real-ESRGAN upscaler...")
    model_path = "/content/Models/RealESRGAN_x4plus.pth"
    if not os.path.exists(model_path):
        pass # !wget -q -c "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth" -O {model_path}
    rrdb_model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
    _upscaler = RealESRGANer(scale=4, model_path=model_path, model=rrdb_model, tile=256, tile_pad=10, pre_pad=0, half=True, gpu_id=0)

def _unload_upscaler():
    global _upscaler
    if _upscaler is not None:
        del _upscaler
        _upscaler = None
        gc.collect()
        torch.cuda.empty_cache()

def _load_face_restorer():
    global _face_restorer
    if _face_restorer is not None: return
    from gfpgan import GFPGANer
    print("👤 Loading GFPGAN face restorer...")
    model_path = "/content/Models/GFPGANv1.4.pth"
    if not os.path.exists(model_path):
        pass # !wget -q -c "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth" -O {model_path}
    _face_restorer = GFPGANer(model_path=model_path, upscale=1, arch='clean', channel_multiplier=2, bg_upsampler=None)

def _unload_face_restorer():
    global _face_restorer
    if _face_restorer is not None:
        del _face_restorer
        _face_restorer = None
        gc.collect()
        torch.cuda.empty_cache()

def _decode_base64_image(b64_string):
    if "," in b64_string:
        b64_string = b64_string.split(",", 1)[1]
    return Image.open(io.BytesIO(base64.b64decode(b64_string))).convert("RGB")

def _encode_image_to_base64(pil_image):
    buffered = io.BytesIO()
    pil_image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

class Txt2ImgRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = "score_4, score_5, score_6, bad hands, blurry, low quality"
    steps: Optional[int] = 20
    cfg_scale: Optional[float] = 6.5
    width: Optional[int] = 832
    height: Optional[int] = 1216
    seed: Optional[int] = -1
    base_model: Optional[Union[dict, str]] = "crucibleRINGPonyxl_v28.safetensors"
    loras: Optional[List[Union[dict, str]]] = []
    embeddings: Optional[List[Union[dict, str]]] = []
    civitai_api_key: Optional[str] = ""

class Img2ImgRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = "score_4, score_5, score_6, bad hands, blurry, low quality"
    init_images: List[str]
    denoising_strength: Optional[float] = 0.5
    steps: Optional[int] = 20
    cfg_scale: Optional[float] = 6.5
    width: Optional[int] = 832
    height: Optional[int] = 1216
    seed: Optional[int] = -1
    mask: Optional[str] = None
    base_model: Optional[Union[dict, str]] = None
    loras: Optional[List[Union[dict, str]]] = []
    embeddings: Optional[List[Union[dict, str]]] = []
    civitai_api_key: Optional[str] = ""

class InterrogateRequest(BaseModel):
    image: str
    model: Optional[str] = "clip"

class UpscaleRequest(BaseModel):
    image: str
    upscaling_resize: Optional[int] = 2

class FaceFixRequest(BaseModel):
    image: str
    prompt: Optional[str] = ""

def download_civitai_model(download_url, dest_path, api_key):
    if os.path.exists(dest_path): return True
    print(f"📥 Downloading missing model to {os.path.basename(dest_path)}...")
    active_key = api_key if api_key else CIVITAI_API_KEY
    headers = {}
    if active_key: headers["Authorization"] = f"Bearer {active_key}"
    try:
        response = requests.get(download_url, headers=headers, stream=True)
        if response.status_code == 200:
            with open(dest_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            if os.path.getsize(dest_path) < 1024 * 1024:
                os.remove(dest_path)
                return False
            return True
        return False
    except Exception as e:
        if os.path.exists(dest_path):
            try: os.remove(dest_path)
            except: pass
        return False

@app.get("/")
def health():
    return {
        "status": "online",
        "gpu": torch.cuda.get_device_name(0),
        "base_model": CURRENT_BASE_MODEL_FILE
    }

@app.post("/sdapi/v1/unload-checkpoint")
def unload_checkpoint():
    global CURRENT_BASE_MODEL_FILE, pipe, pipe_img2img
    CURRENT_BASE_MODEL_FILE = None
    if 'pipe' in globals():
        try: del pipe
        except: pass
    if 'pipe_img2img' in globals():
        try: del pipe_img2img
        except: pass
    gc.collect()
    torch.cuda.empty_cache()
    vram_free = torch.cuda.mem_get_info()[0] / (1024**3)
    return {"status": "ok", "vram_free_gb": round(vram_free, 2)}

def _switch_model_if_needed(req_base_model, civitai_api_key):
    global CURRENT_BASE_MODEL_FILE, pipe, pipe_img2img
    req_base_model_file = CURRENT_BASE_MODEL_FILE
    req_base_model_url = None
    req_architecture = "SDXL 1.0"
    if isinstance(req_base_model, dict):
        req_architecture = req_base_model.get("architecture", "SDXL 1.0")
        req_base_model_file = req_base_model.get("fileName", req_base_model_file)
        req_base_model_url = req_base_model.get("downloadUrl")
    elif isinstance(req_base_model, str) and req_base_model:
        req_base_model_file = req_base_model

    if req_base_model_file != CURRENT_BASE_MODEL_FILE:
        model_path = os.path.join("/content/Models", req_base_model_file)
        if not os.path.exists(model_path):
            if req_base_model_url:
                success = download_civitai_model(req_base_model_url, model_path, civitai_api_key)
                if not success: raise HTTPException(status_code=400, detail=f"Failed to download {req_base_model_file}")
            else:
                raise HTTPException(status_code=400, detail=f"Model {req_base_model_file} not found locally.")

        print(f"🔄 Swapping base model from {CURRENT_BASE_MODEL_FILE} to {req_base_model_file}...")
        if 'pipe' in globals() and pipe is not None:
            try: del pipe
            except: pass
        if 'pipe_img2img' in globals() and pipe_img2img is not None:
            try: del pipe_img2img
            except: pass
        global _upscaler, _face_restorer, _clip_model, _clip_preprocess
        if '_upscaler' in globals() and _upscaler is not None:
            try: del _upscaler
            except: pass
            _upscaler = None
        if '_face_restorer' in globals() and _face_restorer is not None:
            try: del _face_restorer
            except: pass
            _face_restorer = None
        if '_clip_model' in globals() and _clip_model is not None:
            try: del _clip_model
            except: pass
            _clip_model = None
        if '_clip_preprocess' in globals() and _clip_preprocess is not None:
            try: del _clip_preprocess
            except: pass
            _clip_preprocess = None

        gc.collect()
        torch.cuda.empty_cache()

        try:
            if "SD 1.5" in req_architecture or "SD 1.4" in req_architecture:
                from diffusers import StableDiffusionPipeline, StableDiffusionImg2ImgPipeline
                pipe = StableDiffusionPipeline.from_single_file(model_path, config="runwayml/stable-diffusion-v1-5", torch_dtype=torch.float16, use_safetensors=True, low_cpu_mem_usage=True).to("cuda")
                pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
                pipe_img2img = StableDiffusionImg2ImgPipeline(vae=pipe.vae, text_encoder=pipe.text_encoder, tokenizer=pipe.tokenizer, unet=pipe.unet, scheduler=pipe.scheduler)
            elif "Flux" in req_architecture:
                from diffusers import FluxPipeline
                pipe = FluxPipeline.from_single_file(model_path, config="black-forest-labs/FLUX.1-schnell", torch_dtype=torch.bfloat16, low_cpu_mem_usage=True).to("cuda")
                pipe.enable_model_cpu_offload()
                pipe_img2img = None
            else:
                from diffusers import StableDiffusionXLPipeline, StableDiffusionXLImg2ImgPipeline
                pipe = StableDiffusionXLPipeline.from_single_file(model_path, config="stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16, use_safetensors=True, low_cpu_mem_usage=True).to("cuda")
                pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
                pipe_img2img = StableDiffusionXLImg2ImgPipeline(vae=pipe.vae, text_encoder=pipe.text_encoder, text_encoder_2=pipe.text_encoder_2, tokenizer=pipe.tokenizer, tokenizer_2=pipe.tokenizer_2, unet=pipe.unet, scheduler=pipe.scheduler)
        except Exception as e:
            if "CLIPTextModel" in str(e):
                print(f"⚠️ Missing text encoders in {req_base_model_file}. Fetching standard text encoders from HuggingFace...")
                from transformers import CLIPTextModel, CLIPTextModelWithProjection
                if "SD 1.5" in req_architecture or "SD 1.4" in req_architecture:
                    text_encoder = CLIPTextModel.from_pretrained("runwayml/stable-diffusion-v1-5", subfolder="text_encoder", torch_dtype=torch.float16)
                    pipe = StableDiffusionPipeline.from_single_file(model_path, config="runwayml/stable-diffusion-v1-5", text_encoder=text_encoder, torch_dtype=torch.float16, use_safetensors=True, low_cpu_mem_usage=True).to("cuda")
                    pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
                    pipe_img2img = StableDiffusionImg2ImgPipeline(vae=pipe.vae, text_encoder=pipe.text_encoder, tokenizer=pipe.tokenizer, unet=pipe.unet, scheduler=pipe.scheduler)
                else:
                    text_encoder = CLIPTextModel.from_pretrained("stabilityai/stable-diffusion-xl-base-1.0", subfolder="text_encoder", torch_dtype=torch.float16)
                    text_encoder_2 = CLIPTextModelWithProjection.from_pretrained("stabilityai/stable-diffusion-xl-base-1.0", subfolder="text_encoder_2", torch_dtype=torch.float16)
                    pipe = StableDiffusionXLPipeline.from_single_file(model_path, config="stabilityai/stable-diffusion-xl-base-1.0", text_encoder=text_encoder, text_encoder_2=text_encoder_2, torch_dtype=torch.float16, use_safetensors=True, low_cpu_mem_usage=True).to("cuda")
                    pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
                    pipe_img2img = StableDiffusionXLImg2ImgPipeline(vae=pipe.vae, text_encoder=pipe.text_encoder, text_encoder_2=pipe.text_encoder_2, tokenizer=pipe.tokenizer, tokenizer_2=pipe.tokenizer_2, unet=pipe.unet, scheduler=pipe.scheduler)
            else:
                raise e
        CURRENT_BASE_MODEL_FILE = req_base_model_file


def _load_embeddings(target_pipe, embeddings, api_key):
    if not embeddings or not target_pipe: return
    for item in embeddings:
        name = item if isinstance(item, str) else item.get("fileName") or item.get("name")
        if not name: continue
        embed_file = name if name.endswith(".safetensors") or name.endswith(".pt") or name.endswith(".bin") else f"{name}.safetensors"
        embed_path = os.path.join("/content/Embeddings", embed_file)
        embed_url = item.get("downloadUrl") if isinstance(item, dict) else None
        
        if not os.path.exists(embed_path) and embed_url:
            download_civitai_model(embed_url, embed_path, api_key)
            
        if os.path.exists(embed_path):
            try:
                token_name = os.path.splitext(embed_file)[0]
                target_pipe.load_textual_inversion(embed_path, token=token_name)
            except Exception as e:
                print(f"Embedding load note: {e}")

def _apply_loras(target_pipe, loras, api_key, base_model=None):
    loaded_adapters = []
    loaded_weights = []
    if not target_pipe: return loaded_adapters
    
    if "StableDiffusionXL" in str(type(target_pipe)):
        is_pony = "pony" in CURRENT_BASE_MODEL_FILE.lower() or "illustrious" in CURRENT_BASE_MODEL_FILE.lower()
        if base_model:
            arch = base_model.get("architecture", "") if isinstance(base_model, dict) else str(base_model)
            if "pony" in arch.lower() or "illustrious" in arch.lower(): is_pony = True
        if os.path.exists(LIGHTNING_PATH) and not is_pony:
            try:
                adapter_id = "lora_lightning"
                target_pipe.load_lora_weights("/content/LoRAs", weight_name=os.path.basename(LIGHTNING_PATH), adapter_name=adapter_id)
                loaded_weights.append(1.0)
                loaded_adapters.append(adapter_id)
            except Exception as e:
                print(f"Lightning LoRA load note: {e}")

    if not loras:
        if loaded_adapters:
            target_pipe.set_adapters(loaded_adapters, adapter_weights=loaded_weights)
        return loaded_adapters

    for item in loras:
        name = item if isinstance(item, str) else item.get("fileName") or item.get("name")
        weight = 0.85 if isinstance(item, str) else float(item.get("weight", 0.85))
        if not name: continue
        lora_file = name if name.endswith(".safetensors") else f"{name}.safetensors"
        lora_path = os.path.join("/content/LoRAs", lora_file)
        lora_url = item.get("downloadUrl") if isinstance(item, dict) else None
        if not os.path.exists(lora_path) and lora_url:
            download_civitai_model(lora_url, lora_path, api_key)
        if os.path.exists(lora_path) and lora_file != CURRENT_BASE_MODEL_FILE and lora_file != os.path.basename(LIGHTNING_PATH):
            try:
                adapter_id = f"lora_{len(loaded_adapters)}"
                target_pipe.load_lora_weights("/content/LoRAs", weight_name=lora_file, adapter_name=adapter_id)
                loaded_weights.append(weight)
                loaded_adapters.append(adapter_id)
            except Exception as e:
                print(f"LoRA load note: {e}")
    if loaded_adapters:
        target_pipe.set_adapters(loaded_adapters, adapter_weights=loaded_weights)
    return loaded_adapters

def _do_txt2img(req: Txt2ImgRequest):
    _switch_model_if_needed(req.base_model, req.civitai_api_key)
    seed = req.seed if (req.seed is not None and req.seed >= 0) else int(torch.randint(0, 2**32, (1,)).item())
    generator = torch.Generator("cuda").manual_seed(seed)
    _load_embeddings(pipe, req.embeddings, req.civitai_api_key)
    loaded_adapters = _apply_loras(pipe, req.loras, req.civitai_api_key, base_model=req.base_model)
    req_architecture = req.base_model.get("architecture", "") if isinstance(req.base_model, dict) else str(req.base_model)
    is_pony = "pony" in req_architecture.lower() or "pony" in CURRENT_BASE_MODEL_FILE.lower()
    is_illustrious = "illustrious" in req_architecture.lower() or "illustrious" in CURRENT_BASE_MODEL_FILE.lower()
    prompt_str = req.prompt
    if is_pony and "score_" not in req.prompt.lower():
        prompt_str = f"score_9, score_8_up, score_7_up, source_anime, {req.prompt}"

    with torch.inference_mode():
        if "Flux" in str(type(pipe)):
            image = pipe(prompt=prompt_str, num_inference_steps=req.steps, guidance_scale=req.cfg_scale, width=req.width, height=req.height, generator=generator).images[0]
        else:
            image = pipe(prompt=prompt_str, negative_prompt=req.negative_prompt, num_inference_steps=req.steps, guidance_scale=req.cfg_scale, width=req.width, height=req.height, generator=generator).images[0]

    if loaded_adapters:
        try: pipe.delete_adapters(loaded_adapters)
        except: pass

    return {
        "images": [_encode_image_to_base64(image)],
        "source": f"Google Colab Cloud GPU ({torch.cuda.get_device_name(0)})"
    }

@app.post("/sdapi/v1/txt2img")
def txt2img(req: Txt2ImgRequest):
    task_id = str(uuid.uuid4())
    tasks[task_id] = {"status": "processing"}
    threading.Thread(target=_bg_runner, args=(task_id, _do_txt2img, req)).start()
    return {"task_id": task_id}

def _do_img2img(req: Img2ImgRequest):
    _switch_model_if_needed(req.base_model, req.civitai_api_key)
    if not pipe_img2img:
        raise HTTPException(status_code=400, detail="img2img is not supported on this model architecture yet.")
    seed = req.seed if (req.seed is not None and req.seed >= 0) else int(torch.randint(0, 2**32, (1,)).item())
    generator = torch.Generator("cuda").manual_seed(seed)
    init_image = _decode_base64_image(req.init_images[0]).resize((req.width, req.height), Image.LANCZOS)
    _load_embeddings(pipe_img2img, req.embeddings, req.civitai_api_key)
    loaded_adapters = _apply_loras(pipe_img2img, req.loras, req.civitai_api_key, base_model=req.base_model)
    req_architecture = req.base_model.get("architecture", "") if isinstance(req.base_model, dict) else str(req.base_model)
    is_pony = "pony" in req_architecture.lower() or "pony" in CURRENT_BASE_MODEL_FILE.lower()
    is_illustrious = "illustrious" in req_architecture.lower() or "illustrious" in CURRENT_BASE_MODEL_FILE.lower()
    prompt_str = req.prompt
    if is_pony and "score_" not in req.prompt.lower():
        prompt_str = f"score_9, score_8_up, score_7_up, source_anime, {req.prompt}"

    with torch.inference_mode():
        image = pipe_img2img(prompt=prompt_str, negative_prompt=req.negative_prompt, image=init_image, strength=req.denoising_strength, num_inference_steps=req.steps, guidance_scale=req.cfg_scale, generator=generator).images[0]

    if loaded_adapters:
        try: pipe_img2img.delete_adapters(loaded_adapters)
        except: pass

    return {
        "images": [_encode_image_to_base64(image)],
        "source": f"Google Colab Cloud GPU ({torch.cuda.get_device_name(0)})"
    }

@app.post("/sdapi/v1/img2img")
def img2img(req: Img2ImgRequest):
    task_id = str(uuid.uuid4())
    tasks[task_id] = {"status": "processing"}
    threading.Thread(target=_bg_runner, args=(task_id, _do_img2img, req)).start()
    return {"task_id": task_id}

def _do_interrogate(req: InterrogateRequest):
    _load_tagger()
    image = _decode_base64_image(req.image)
    
    target_size = 448
    img = image.convert("RGB")
    w, h = img.size
    max_dim = max(w, h)
    pad_img = Image.new("RGB", (max_dim, max_dim), (255, 255, 255))
    pad_img.paste(img, (max_dim//2 - w//2, max_dim//2 - h//2))
    img = pad_img.resize((target_size, target_size), Image.BICUBIC)
    
    image_array = np.array(img, dtype=np.float32)
    image_array = image_array[:, :, ::-1] # RGB to BGR
    image_array = np.expand_dims(image_array, axis=0)
    
    input_name = _tagger_session.get_inputs()[0].name
    output_name = _tagger_session.get_outputs()[0].name
    
    preds = _tagger_session.run([output_name], {input_name: image_array})[0][0]
    
    threshold = 0.35
    tag_preds = preds[4:]
    tag_names = _tagger_tags[4:]
    
    final_tags = []
    for p, name in zip(tag_preds, tag_names):
        if p > threshold:
            final_tags.append(name.replace('_', ' '))
            
    _unload_tagger()
    return {"caption": ", ".join(final_tags)}

@app.post("/sdapi/v1/interrogate")
def interrogate(req: InterrogateRequest):
    task_id = str(uuid.uuid4())
    tasks[task_id] = {"status": "processing"}
    threading.Thread(target=_bg_runner, args=(task_id, _do_interrogate, req)).start()
    return {"task_id": task_id}

def _do_upscale(req: UpscaleRequest):
    _load_upscaler()
    image = _decode_base64_image(req.image)
    img_bgr = np.array(image)[:, :, ::-1]
    output, _ = _upscaler.enhance(img_bgr, outscale=req.upscaling_resize)
    result_image = Image.fromarray(output[:, :, ::-1])
    _unload_upscaler()
    return {"images": [_encode_image_to_base64(result_image)], "source": "Real-ESRGAN"}

@app.post("/sdapi/v1/extra-single-image")
def upscale(req: UpscaleRequest):
    task_id = str(uuid.uuid4())
    tasks[task_id] = {"status": "processing"}
    threading.Thread(target=_bg_runner, args=(task_id, _do_upscale, req)).start()
    return {"task_id": task_id}

def _do_face_fix(req: FaceFixRequest):
    _load_face_restorer()
    image = _decode_base64_image(req.image)
    img_bgr = np.array(image)[:, :, ::-1]
    _, _, output = _face_restorer.enhance(img_bgr, has_aligned=False, only_center_face=False, paste_back=True)
    result_image = Image.fromarray(output[:, :, ::-1])
    _unload_face_restorer()
    return {"images": [_encode_image_to_base64(result_image)], "source": "GFPGAN"}

@app.post("/sdapi/v1/face-fix")
def face_fix(req: FaceFixRequest):
    task_id = str(uuid.uuid4())
    tasks[task_id] = {"status": "processing"}
    threading.Thread(target=_bg_runner, args=(task_id, _do_face_fix, req)).start()
    return {"task_id": task_id}

threading.Thread(target=lambda: uvicorn.run(app, host="0.0.0.0", port=8000, log_level="warning"), daemon=True).start()
time.sleep(2)
tunnel = try_cloudflare(port=8000)
print(f"\n🎉 COPY THIS URL: {tunnel.tunnel}\n")

