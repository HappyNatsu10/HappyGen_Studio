# Cell 1: Install Dependencies
# Remove torchaudio (causes CUDA version mismatch crashes, not needed for image generation)
!pip uninstall -y torchaudio 2>/dev/null
# Install core AI + server dependencies (do NOT pin numpy/protobuf - Colab Python 3.13 needs modern versions)
!pip install -U -q diffusers transformers accelerate safetensors sentencepiece fastapi uvicorn pydantic pycloudflared nest_asyncio python-multipart peft torchao>=0.16.0 open_clip_torch compel "Pillow>=11.0.0,<12.0.0"
# Install upscaler dependencies (BasicSR from source with version fix)
!rm -rf BasicSR && git clone --depth 1 -q https://github.com/xinntao/BasicSR.git
!cd BasicSR && sed -i 's/return locals().*/return "1.4.2"/g' setup.py && pip install -q .
!pip install -q facexlib realesrgan gfpgan


# Cell 2: Download Models & SDXL Lightning Accelerator
import os
os.makedirs("/kaggle/working/Models", exist_ok=True)
os.makedirs("/kaggle/working/LoRAs", exist_ok=True)
os.makedirs("/kaggle/working/Embeddings", exist_ok=True)

# Define the path for the desired Civitai base model
BASE_MODEL_PATH = "/kaggle/working/Models/crucibleRINGPonyxl_v28.safetensors"
LIGHTNING_PATH = "/kaggle/working/LoRAs/sdxl_lightning_4step_lora.safetensors"

# Import userdata for secrets

try:
    try:
        try:
            CIVITAI_API_KEY = userdata.get('CIVITAI_API_KEY')
        except Exception:
            CIVITAI_API_KEY = ''
    except:
        CIVITAI_API_KEY = None
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
    pass
    print("📥 Downloading CrucibleRING PonyXL v28 (~6.6GB) from Civitai...")
    if os.path.exists(BASE_MODEL_PATH) and os.path.getsize(BASE_MODEL_PATH) < 1024 * 1024:
        print(f"⚠️ Download failed. It might be corrupted. Deleting file.")
        os.remove(BASE_MODEL_PATH)
    else:
        print(f"✅ Base model downloaded successfully.")

if not os.path.exists(LIGHTNING_PATH):
    print("⚡ Downloading SDXL Lightning 4-Step LoRA...")
    !wget -c "https://huggingface.co/ByteDance/SDXL-Lightning/resolve/main/sdxl_lightning_4step_lora.safetensors" -O {LIGHTNING_PATH}

print("✅ Storage ready! Models directory is prepared.")


















# Cell 3: Prepare GPU (model loads on first request)
import torch
from diffusers import StableDiffusionXLPipeline, StableDiffusionXLImg2ImgPipeline, EulerAncestralDiscreteScheduler

print(f"🚀 GPU ready: {torch.cuda.get_device_name(0)} with {torch.cuda.mem_get_info()[0] / (1024**3):.1f} GB free VRAM")
CURRENT_BASE_MODEL_FILE = None
pipe = None
pipe_img2img = None

print("✅ Server initialized. Model will load on first generation request.")


















import os
import subprocess
import torch
from diffusers import StableDiffusionXLPipeline, StableDiffusionXLImg2ImgPipeline, StableDiffusionXLInpaintPipeline, EulerAncestralDiscreteScheduler
import io, base64, time, json, threading, nest_asyncio, uuid
import numpy as np
import PIL.Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Union
import uvicorn
from pycloudflared import try_cloudflare
import requests
import gc
import sys
import torchvision.transforms.functional as TF

# Monkey patch for BasicSR PyTorch >= 2.1 bug
if 'torchvision.transforms.functional_tensor' not in sys.modules:
    sys.modules['torchvision.transforms.functional_tensor'] = TF

def run_cmd(cmd):
    print(f"Running: {cmd}")
    os.system(cmd)

run_cmd("pip install -q diffusers transformers accelerate safetensors sentencepiece protobuf fastapi uvicorn pydantic pycloudflared nest_asyncio python-multipart peft open_clip_torch")
run_cmd("pip install -q git+https://github.com/xinntao/BasicSR.git")
run_cmd("pip install -q realesrgan gfpgan ultralytics")
run_cmd("wget -q -c https://huggingface.co/Bingsu/adetailer/resolve/main/face_yolov8n.pt -O /kaggle/working/Models/yolov8n-face.pt")

# Cell 2: Download Models & SDXL Lightning Accelerator
os.makedirs("/kaggle/working/Models", exist_ok=True)
os.makedirs("/kaggle/working/LoRAs", exist_ok=True)

BASE_MODEL_PATH = "/kaggle/working/Models/crucibleRINGPonyxl_v28.safetensors"
LIGHTNING_PATH = "/kaggle/working/LoRAs/sdxl_lightning_4step_lora.safetensors"

CIVITAI_API_KEY = None
try:
    try:
        try:
            CIVITAI_API_KEY = userdata.get('CIVITAI_API_KEY')
        except Exception:
            CIVITAI_API_KEY = ''
    except:
        CIVITAI_API_KEY = None
except:
    pass

def civitai_download_url(model_version_id):
    base_url = f"https://civitai.com/api/download/models/{model_version_id}"
    if CIVITAI_API_KEY:
        return f"{base_url}?token={CIVITAI_API_KEY}"
    return base_url

if os.path.exists(BASE_MODEL_PATH) and os.path.getsize(BASE_MODEL_PATH) < 1024 * 1024:
    os.remove(BASE_MODEL_PATH)

if not os.path.exists(BASE_MODEL_PATH):
    pass

if not os.path.exists(LIGHTNING_PATH):
    run_cmd(f'wget -c "https://huggingface.co/ByteDance/SDXL-Lightning/resolve/main/sdxl_lightning_4step_lora.safetensors" -O {LIGHTNING_PATH}')

# Cell 3: Load Model into 16GB Cloud VRAM
CURRENT_BASE_MODEL_FILE = None
global pipe, pipe_img2img, pipe_inpaint
pipe = pipe_img2img = pipe_inpaint = None
# Cell 4: Launch FastAPI Server
nest_asyncio.apply()
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

_clip_model = _clip_preprocess = _upscaler = _face_restorer = None

tasks = {}
def _bg_runner(task_id, func, *args, **kwargs):
    try:
        res = func(*args, **kwargs)
        tasks[task_id]['status'] = 'completed'
        tasks[task_id]['result'] = res
    except Exception as e:
        import traceback
        tasks[task_id]['status'] = 'failed'
        tasks[task_id]['error'] = f"{str(e)} | Traceback: {traceback.format_exc()}"

@app.get("/async/status/{task_id}")
def async_status(task_id: str):
    if task_id not in tasks: return {"status": "not_found"}
    return tasks[task_id]

def _load_clip():
    global _clip_model, _clip_preprocess
    if _clip_model is not None: return
    from transformers import BlipProcessor, BlipForConditionalGeneration
    _clip_preprocess = BlipProcessor.from_pretrained('Salesforce/blip-image-captioning-large')
    _clip_model = BlipForConditionalGeneration.from_pretrained('Salesforce/blip-image-captioning-large').to("cuda", torch.float16)

def _unload_clip():
    global _clip_model, _clip_preprocess
    if _clip_model is not None:
        _clip_model = _clip_model.to("cpu")
        del _clip_model, _clip_preprocess
        _clip_model = _clip_preprocess = None
        gc.collect()
        torch.cuda.empty_cache()

def _load_upscaler():
    global _upscaler
    if _upscaler is not None: return
    from realesrgan import RealESRGANer
    from basicsr.archs.rrdbnet_arch import RRDBNet
    model_path = "/kaggle/working/Models/RealESRGAN_x4plus.pth"
    if not os.path.exists(model_path):
        run_cmd(f'wget -q -c "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth" -O {model_path}')
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
    model_path = "/kaggle/working/Models/GFPGANv1.4.pth"
    if not os.path.exists(model_path):
        run_cmd(f'wget -q -c "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth" -O {model_path}')
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
    return PIL.Image.open(io.BytesIO(base64.b64decode(b64_string))).convert("RGB")

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
    engine: Optional[str] = "GFPGAN"
    base_model: Optional[Union[dict, str]] = None
    civitai_api_key: Optional[str] = ""

def download_civitai_model(download_url, dest_path, api_key):
    if os.path.exists(dest_path): return True
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
    return {"status": "online", "gpu": torch.cuda.get_device_name(0), "base_model": CURRENT_BASE_MODEL_FILE}

@app.post("/sdapi/v1/unload-checkpoint")
def unload_checkpoint():
    global CURRENT_BASE_MODEL_FILE, pipe, pipe_img2img, pipe_inpaint
    CURRENT_BASE_MODEL_FILE = None
    if 'pipe' in globals():
        try: del pipe
        except: pass
    if 'pipe_img2img' in globals():
        try: del pipe_img2img
        except: pass
    if 'pipe_inpaint' in globals():
        try: del pipe_inpaint
        except: pass
    gc.collect()
    torch.cuda.empty_cache()
    vram_free = torch.cuda.mem_get_info()[0] / (1024**3)
    return {"status": "ok", "vram_free_gb": round(vram_free, 2)}

def _switch_model_if_needed(req_base_model, civitai_api_key):
    global CURRENT_BASE_MODEL_FILE, pipe, pipe_img2img, pipe_inpaint
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
        model_path = os.path.join("/kaggle/working/Models", req_base_model_file)
        if not os.path.exists(model_path):
            if req_base_model_url:
                success = download_civitai_model(req_base_model_url, model_path, civitai_api_key)
                if not success: raise HTTPException(status_code=400, detail=f"Failed to download {req_base_model_file}")
            else:
                if req_architecture != "Anima":
                    raise HTTPException(status_code=400, detail=f"Model {req_base_model_file} not found locally.")
        if 'pipe' in globals() and pipe is not None:
            try: del pipe
            except: pass
        if 'pipe_img2img' in globals() and pipe_img2img is not None:
            try: del pipe_img2img
            except: pass
        if 'pipe_inpaint' in globals() and pipe_inpaint is not None:
            try: del pipe_inpaint
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
            
        import gc
        gc.collect()
        torch.cuda.empty_cache()

        if req_architecture == "Anima":
            from diffusers import DiffusionPipeline
            pipe = DiffusionPipeline.from_pretrained("CalamitousFelicitousness/Anima-1.0-Base-Diffusers", torch_dtype=torch.bfloat16, trust_remote_code=True, custom_pipeline="CalamitousFelicitousness/Anima-1.0-Base-Diffusers").to("cuda")
            
            if model_path.endswith(".safetensors") and os.path.exists(model_path) and req_base_model_file != "Anima-1.0-Base-Diffusers":
                try:
                    print(f"Attempting to inject custom Anima weights from {req_base_model_file}...")
                    from safetensors.torch import load_file
                    state_dict = load_file(model_path)
                    transformer_dict = {}
                    for k, v in state_dict.items():
                        if "transformer." in k: transformer_dict[k.replace("transformer.", "")] = v
                        elif "model.diffusion_model." not in k and "text_encoder" not in k and "vae" not in k:
                            transformer_dict[k] = v
                    if transformer_dict:
                        pipe.transformer.load_state_dict(transformer_dict, strict=False)
                        print("Successfully injected custom Anima transformer weights!")
                except Exception as e:
                    print(f"Failed to inject custom Anima weights: {e}")
                    
            pipe_img2img = pipe
            pipe_inpaint = pipe
        elif "SD 1.5" in req_architecture or "SD 1.4" in req_architecture:
            from diffusers import StableDiffusionPipeline, StableDiffusionImg2ImgPipeline, StableDiffusionInpaintPipeline
            try:
                pipe = StableDiffusionPipeline.from_single_file(model_path, config="runwayml/stable-diffusion-v1-5", torch_dtype=torch.float16, use_safetensors=True, low_cpu_mem_usage=True).to("cuda")
            except Exception as e_sd15:
                err_sd15 = str(e_sd15)
                if "CLIPTextModel" in err_sd15 or "text_encoder" in err_sd15:
                    print("Missing text encoders in SD 1.5 checkpoint. Loading from base SD 1.5...")
                    from transformers import CLIPTextModel
                    text_encoder = CLIPTextModel.from_pretrained("runwayml/stable-diffusion-v1-5", subfolder="text_encoder", torch_dtype=torch.float16)
                    pipe = StableDiffusionPipeline.from_single_file(model_path, config="runwayml/stable-diffusion-v1-5", text_encoder=text_encoder, torch_dtype=torch.float16, use_safetensors=True, low_cpu_mem_usage=True).to("cuda")
                else:
                    raise e_sd15
            pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
            pipe_img2img = StableDiffusionImg2ImgPipeline(**pipe.components)
            pipe_inpaint = StableDiffusionInpaintPipeline(**pipe.components)
        elif "Flux" in req_architecture:
            from diffusers import FluxPipeline
            pipe = FluxPipeline.from_single_file(model_path, torch_dtype=torch.bfloat16, low_cpu_mem_usage=True).to("cuda")
            pipe.enable_model_cpu_offload()
            pipe_img2img = None
            pipe_inpaint = None
        else:
            from diffusers import StableDiffusionXLPipeline, StableDiffusionXLImg2ImgPipeline, StableDiffusionXLInpaintPipeline
            try:
                pipe = StableDiffusionXLPipeline.from_single_file(model_path, torch_dtype=torch.float16, use_safetensors=True).to("cuda")
            except Exception as e:
                err_msg = str(e)
                if "UNet2DConditionModel" in err_msg or "label_emb" in err_msg or "from_pretrained" in err_msg:
                    print(f"Detected architecture mismatch. Falling back to SD 1.5 Pipeline... ({err_msg[:100]})")
                    from diffusers import StableDiffusionPipeline, StableDiffusionImg2ImgPipeline, StableDiffusionInpaintPipeline
                    try:
                        pipe = StableDiffusionPipeline.from_single_file(model_path, config="runwayml/stable-diffusion-v1-5", torch_dtype=torch.float16, use_safetensors=True).to("cuda")
                    except Exception as e_sd15_fb:
                        err_sd15_fb = str(e_sd15_fb)
                        if "CLIPTextModel" in err_sd15_fb or "text_encoder" in err_sd15_fb:
                            print("Missing text encoders in SD 1.5 checkpoint. Loading from base SD 1.5...")
                            from transformers import CLIPTextModel
                            text_encoder = CLIPTextModel.from_pretrained("runwayml/stable-diffusion-v1-5", subfolder="text_encoder", torch_dtype=torch.float16)
                            pipe = StableDiffusionPipeline.from_single_file(model_path, config="runwayml/stable-diffusion-v1-5", text_encoder=text_encoder, torch_dtype=torch.float16, use_safetensors=True).to("cuda")
                        else:
                            raise e_sd15_fb
                    pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
                    pipe_img2img = StableDiffusionImg2ImgPipeline(**pipe.components)
                    pipe_inpaint = StableDiffusionInpaintPipeline(**pipe.components)
                    CURRENT_BASE_MODEL_FILE = req_base_model_file
                    return
                else:
                    from transformers import CLIPTextModel, CLIPTextModelWithProjection
                    print('Missing text encoders in checkpoint. Loading from base SDXL...')
                    text_encoder = CLIPTextModel.from_pretrained('stabilityai/stable-diffusion-xl-base-1.0', subfolder='text_encoder', torch_dtype=torch.float16)
                    text_encoder_2 = CLIPTextModelWithProjection.from_pretrained('stabilityai/stable-diffusion-xl-base-1.0', subfolder='text_encoder_2', torch_dtype=torch.float16)
                    pipe = StableDiffusionXLPipeline.from_single_file(model_path, text_encoder=text_encoder, text_encoder_2=text_encoder_2, torch_dtype=torch.float16, use_safetensors=True).to('cuda')
            pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(pipe.scheduler.config)
            pipe_img2img = StableDiffusionXLImg2ImgPipeline(vae=pipe.vae, text_encoder=pipe.text_encoder, text_encoder_2=pipe.text_encoder_2, tokenizer=pipe.tokenizer, tokenizer_2=pipe.tokenizer_2, unet=pipe.unet, scheduler=pipe.scheduler)
            pipe_inpaint = StableDiffusionXLInpaintPipeline(vae=pipe.vae, text_encoder=pipe.text_encoder, text_encoder_2=pipe.text_encoder_2, tokenizer=pipe.tokenizer, tokenizer_2=pipe.tokenizer_2, unet=pipe.unet, scheduler=pipe.scheduler)

        CURRENT_BASE_MODEL_FILE = req_base_model_file


def _manual_fuse_lora(target_pipe, lora_path, weight=1.0, is_unfuse=False):
    from safetensors.torch import load_file
    import torch
    multiplier = -float(weight) if is_unfuse else float(weight)
    state_dict = load_file(lora_path)
    module_map = {}
    for name, module in target_pipe.transformer.named_modules():
        if hasattr(module, "weight"):
            module_map[name] = module
    
    # Cosmos LoRA -> Diffusers Name Map
    cosmos_to_diffusers = {
        "adaln_modulation_self_attn.1": "norm1.linear_1",
        "adaln_modulation_self_attn.2": "norm1.linear_2",
        "self_attn.q_proj": "attn1.to_q",
        "self_attn.k_proj": "attn1.to_k",
        "self_attn.v_proj": "attn1.to_v",
        "self_attn.output_proj": "attn1.to_out.0",
        "adaln_modulation_cross_attn.1": "norm2.linear_1",
        "adaln_modulation_cross_attn.2": "norm2.linear_2",
        "cross_attn.q_proj": "attn2.to_q",
        "cross_attn.k_proj": "attn2.to_k",
        "cross_attn.v_proj": "attn2.to_v",
        "cross_attn.output_proj": "attn2.to_out.0",
        "adaln_modulation_mlp.1": "norm3.linear_1",
        "adaln_modulation_mlp.2": "norm3.linear_2",
        "mlp.layer1": "ff.net.0.proj",
        "mlp.layer2": "ff.net.2",
    }
    
    lora_groups = {}
    for key, tensor in state_dict.items():
        module_path = None
        weight_type = None
        if ".lora_A.weight" in key:
            module_path = key.replace(".lora_A.weight", "")
            weight_type = "down"
        elif ".lora_B.weight" in key:
            module_path = key.replace(".lora_B.weight", "")
            weight_type = "up"
        elif ".lora_down.weight" in key:
            module_path = key.replace(".lora_down.weight", "")
            weight_type = "down"
        elif ".lora_up.weight" in key:
            module_path = key.replace(".lora_up.weight", "")
            weight_type = "up"
        elif ".alpha" in key:
            module_path = key.replace(".alpha", "")
            weight_type = "alpha"
            
        if module_path is None: continue
        
        if module_path not in lora_groups: lora_groups[module_path] = {}
        if weight_type == "alpha":
            lora_groups[module_path]["alpha"] = tensor.item()
        else:
            lora_groups[module_path][weight_type] = tensor
            
    applied = 0
    for module_path, group in lora_groups.items():
        if "up" not in group or "down" not in group: continue
        
        target_module = None
        
        # 1. Try Kohya diffusers format (underscores)
        for diff_name in sorted(module_map.keys(), key=len, reverse=True):
            if diff_name.replace(".", "_") in module_path:
                target_module = module_map[diff_name]
                break
                
        # 2. Try original dot-based Cosmos/Diffusers format
        if target_module is None:
            stripped = module_path.replace("diffusion_model.", "").replace("blocks.", "transformer_blocks.")
            
            # Add handling for Kohya Cosmos format (e.g. lora_unet_blocks_0_cross_attn_k_proj)
            if "lora_unet_blocks_" in stripped:
                stripped = stripped.replace("lora_unet_blocks_", "transformer_blocks.")
                for cosmos_name, diffusers_name in cosmos_to_diffusers.items():
                    cosmos_under = cosmos_name.replace(".", "_")
                    if stripped.endswith("_" + cosmos_under):
                        stripped = stripped.replace("_" + cosmos_under, "." + diffusers_name)
                        break

            for cosmos_name, diffusers_name in cosmos_to_diffusers.items():
                if stripped.endswith("." + cosmos_name):
                    stripped = stripped.replace("." + cosmos_name, "." + diffusers_name)
                    break
            if stripped in module_map:
                target_module = module_map[stripped]
            
        if target_module is None: continue
        
        up = group["up"].to(device=target_module.weight.device, dtype=torch.float32)
        down = group["down"].to(device=target_module.weight.device, dtype=torch.float32)
        alpha = group.get("alpha", down.shape[0])
        rank = down.shape[0]
        scale = alpha / rank
        with torch.no_grad():
            if len(up.shape) == 2 and len(down.shape) == 2:
                delta = (up @ down) * scale * multiplier
                target_module.weight.data += delta.to(target_module.weight.dtype)
                applied += 1
            elif len(up.shape) == 4 and len(down.shape) == 4:
                up_s = up.squeeze()
                down_s = down.squeeze()
                if len(up_s.shape) == 2 and len(down_s.shape) == 2:
                    delta = (up_s @ down_s).unsqueeze(2).unsqueeze(3) * scale * multiplier
                    target_module.weight.data += delta.to(target_module.weight.dtype)
                    applied += 1
                    
    action = "unfuse" if is_unfuse else "fuse"
    print(f"Manual LoRA {action}: matched {applied} layers from {len(state_dict)} keys ({len(lora_groups)} groups)")
    if applied == 0 and not is_unfuse:
        sample_keys = list(lora_groups.keys())[:5]
        raise ValueError(f"LoRA key mismatch! Still 0 layers matched. Checked {len(lora_groups)} groups. Sample keys: {sample_keys}")
    return applied

_lora_counter = 0

def _apply_loras(target_pipe, loras, api_key, warnings_list=None):
    # Monkeypatch diffusers PEFT bug for empty rank_dict in LyCORIS text encoders
    import diffusers.utils.peft_utils
    if not hasattr(diffusers.utils.peft_utils, "_orig_get_peft_kwargs"):
        diffusers.utils.peft_utils._orig_get_peft_kwargs = diffusers.utils.peft_utils.get_peft_kwargs
        def _patched_get_peft_kwargs(rank_dict, *args, **kwargs):
            if not rank_dict:
                return {"r": 8, "lora_alpha": 8, "target_modules": []}
            return diffusers.utils.peft_utils._orig_get_peft_kwargs(rank_dict, *args, **kwargs)
        diffusers.utils.peft_utils.get_peft_kwargs = _patched_get_peft_kwargs

    if warnings_list is None: warnings_list = []
    global _lora_counter
    loaded_adapters = []
    loaded_weights = []
    manual_fused = []
    if not loras or not target_pipe: return loaded_adapters, manual_fused

    # Clean up any stale adapters from previous generations
    try:
        existing = getattr(target_pipe, 'get_list_adapters', lambda: {})()
        if existing:
            existing_names = list(set(n for names in existing.values() for n in names)) if isinstance(existing, dict) else list(existing)
            if existing_names:
                try: target_pipe.delete_adapters(existing_names)
                except: pass
        try: target_pipe.unload_lora_weights()
        except: pass
    except:
        pass

    is_anima = hasattr(target_pipe, "transformer") and not hasattr(target_pipe, "unet")
    for item in loras:
        name = item if isinstance(item, str) else item.get("fileName") or item.get("name")
        weight = 0.85 if isinstance(item, str) else float(item.get("weight", 0.85))
        if not name: continue
        lora_file = name if name.endswith(".safetensors") else f"{name}.safetensors"
        lora_path = os.path.join("/kaggle/working/LoRAs", lora_file)
        lora_url = item.get("downloadUrl") if isinstance(item, dict) else None
        if not os.path.exists(lora_path) and lora_url:
            download_civitai_model(lora_url, lora_path, api_key)
        if os.path.exists(lora_path) and lora_file != CURRENT_BASE_MODEL_FILE and lora_file != os.path.basename(LIGHTNING_PATH):
            if is_anima:
                try:
                    _manual_fuse_lora(target_pipe, lora_path, weight=weight, is_unfuse=False)
                    manual_fused.append((lora_path, weight))
                    print(f"Manually fused LoRA {lora_file} (weight: {weight})")
                except Exception as e:
                    warnings_list.append(f"Failed to manually fuse LoRA {lora_file}: {e}")
            else:
                try:
                    _lora_counter += 1
                    adapter_id = f"lora_{_lora_counter}"
                    try:
                        target_pipe.load_lora_weights("/kaggle/working/LoRAs", weight_name=lora_file, adapter_name=adapter_id)
                    except Exception as peft_e:
                        if "No `target_modules` passed" in str(peft_e) or "target_parameters" in str(peft_e):
                            if hasattr(target_pipe, "delete_adapters"):
                                try: target_pipe.delete_adapters([adapter_id])
                                except: pass
                            elif hasattr(target_pipe.unet, "delete_adapters"):
                                try: target_pipe.unet.delete_adapters(adapter_id)
                                except: pass
                                
                            from safetensors.torch import load_file
                            import builtins
                            __import__('os')
                            sd = load_file(__import__('os').path.join("/kaggle/working/LoRAs", lora_file))
                            unet_only_sd = {k: v for k, v in sd.items() if "text_encoder" not in k and "lora_te" not in k}
                            target_pipe.load_lora_weights(unet_only_sd, adapter_name=adapter_id)
                            print(f"Fallback UNet-only load for {lora_file} succeeded!")
                        else:
                            raise peft_e
                    loaded_weights.append(weight)
                    loaded_adapters.append(adapter_id)
                except Exception as e:
                    if "list index out of range" in str(e):
                        try:
                            if "lycoris" not in sys.modules:
                                print("Installing lycoris-lora to handle advanced LoRA formats...")
                                os.system("pip install -q lycoris-lora")
                            # Use strictly unique adapter names for each attempt
                            import uuid
                            fb1 = adapter_id + "_fb1_" + uuid.uuid4().hex[:6]
                            try:
                                target_pipe.load_lora_weights("/kaggle/working/LoRAs", weight_name=lora_file, adapter_name=fb1)
                                loaded_adapters.append(fb1)
                                loaded_weights.append(weight)
                            except Exception:
                                fb2 = adapter_id + "_fb2_" + uuid.uuid4().hex[:6]
                                target_pipe.load_lora_weights("/kaggle/working/LoRAs", weight_name=lora_file, adapter_name=fb2, use_peft=False)
                                loaded_adapters.append(fb2)
                                loaded_weights.append(weight)
                            continue
                        except Exception as e2:
                            import traceback
                            warnings_list.append(f"Failed to load LoRA '{lora_file}'. Unsupported format or architecture mismatch. Error: {e} | Fallback Error: {e2} | Traceback: {traceback.format_exc()}")
                    else:
                        import traceback
                        warnings_list.append(f"Failed to load LoRA '{lora_file}'. Unsupported format (e.g. LyCORIS) or architecture mismatch. Error: {e} | Traceback: {traceback.format_exc()}")
    if loaded_adapters:
        target_pipe.set_adapters(loaded_adapters, adapter_weights=loaded_weights)
    return loaded_adapters, manual_fused

def _do_txt2img(req: Txt2ImgRequest):
    _switch_model_if_needed(req.base_model, req.civitai_api_key)
    seed = req.seed if (req.seed is not None and req.seed >= 0) else int(torch.randint(0, 2**32, (1,)).item())
    generator = torch.Generator("cuda").manual_seed(seed)
    warnings = []
    loaded_adapters , manual_fused = _apply_loras(pipe, req.loras, req.civitai_api_key, warnings)
    is_pony = "pony" in str(req.base_model).lower() or "pony" in str(globals().get("CURRENT_BASE_MODEL_FILE", "")).lower()
    if is_pony:
        prompt_str = req.prompt if "score_" in req.prompt else f"score_9, score_8_up, score_7_up, source_anime, {req.prompt}"
        neg_prompt_str = req.negative_prompt if req.negative_prompt and "score_" in req.negative_prompt else f"score_4, score_5, score_6, score_4_up, score_5_up, score_6_up, rating_explicit, {req.negative_prompt or ''}"
    else:
        prompt_str = req.prompt
        neg_prompt_str = req.negative_prompt

    with torch.inference_mode():
        import sys, os
        if "compel" not in sys.modules:
            os.system("pip install -q compel")
            
        prompt_embeds = None
        pooled_prompt_embeds = None
        negative_prompt_embeds = None
        negative_pooled_prompt_embeds = None
        
        # Don't use compel for Flux or Anima which use T5 natively
        is_custom_arch = "Flux" in str(type(pipe)) or "Anima" in str(type(pipe))
        if not is_custom_arch:
            try:
                from compel import Compel, ReturnedEmbeddingsType
                if hasattr(pipe, 'tokenizer_2') and pipe.tokenizer_2 is not None:
                    compel_obj = Compel(tokenizer=[pipe.tokenizer, pipe.tokenizer_2], text_encoder=[pipe.text_encoder, pipe.text_encoder_2], returned_embeddings_type=ReturnedEmbeddingsType.PENULTIMATE_HIDDEN_STATES_NON_NORMALIZED, requires_pooled=[False, True], truncate_long_prompts=False)
                    prompt_embeds, pooled_prompt_embeds = compel_obj(prompt_str)
                    if neg_prompt_str:
                        negative_prompt_embeds, negative_pooled_prompt_embeds = compel_obj(neg_prompt_str)
                        [prompt_embeds, negative_prompt_embeds] = compel_obj.pad_conditioning_tensors_to_same_length([prompt_embeds, negative_prompt_embeds])
                elif hasattr(pipe, 'tokenizer') and pipe.tokenizer is not None and not hasattr(pipe, 'tokenizer_3'):
                    compel_obj = Compel(tokenizer=pipe.tokenizer, text_encoder=pipe.text_encoder, truncate_long_prompts=False)
                    prompt_embeds = compel_obj(prompt_str)
                    if neg_prompt_str:
                        negative_prompt_embeds = compel_obj(neg_prompt_str)
                        [prompt_embeds, negative_prompt_embeds] = compel_obj.pad_conditioning_tensors_to_same_length([prompt_embeds, negative_prompt_embeds])
            except Exception as e:
                print(f"Compel encoding failed: {e}")
                
        kwargs = {
            "num_inference_steps": req.steps,
            "guidance_scale": req.cfg_scale,
            "width": req.width,
            "height": req.height,
            "generator": generator
        }
        
        if is_custom_arch:
            kwargs["prompt"] = prompt_str
            if "Flux" not in str(type(pipe)):
                kwargs["negative_prompt"] = neg_prompt_str
        else:
            if prompt_embeds is not None:
                kwargs["prompt_embeds"] = prompt_embeds
                if negative_prompt_embeds is not None: kwargs["negative_prompt_embeds"] = negative_prompt_embeds
                if pooled_prompt_embeds is not None: kwargs["pooled_prompt_embeds"] = pooled_prompt_embeds
                if negative_pooled_prompt_embeds is not None: kwargs["negative_pooled_prompt_embeds"] = negative_pooled_prompt_embeds
            else:
                kwargs["prompt"] = prompt_str
                if neg_prompt_str: kwargs["negative_prompt"] = neg_prompt_str

        image = pipe(**kwargs).images[0]

    if manual_fused:
        for _lp, _lw in manual_fused:
            try: _manual_fuse_lora(pipe, _lp, weight=_lw, is_unfuse=True)
            except: pass
    if loaded_adapters:
        try: pipe.delete_adapters(loaded_adapters)
        except: pass
    return {"images": [_encode_image_to_base64(image)], "source": f"Google Colab Cloud GPU ({torch.cuda.get_device_name(0)})", "warnings": warnings}

@app.post("/sdapi/v1/txt2img")
def txt2img(req: Txt2ImgRequest):
    task_id = str(uuid.uuid4())
    tasks[task_id] = {"status": "processing"}
    threading.Thread(target=_bg_runner, args=(task_id, _do_txt2img, req)).start()
    return {"task_id": task_id}


def _anima_img2img(pipe, prompt, negative_prompt, init_image, strength, num_inference_steps, guidance_scale, generator, mask_image=None):
    device = pipe._execution_device
    transformer_dtype = pipe.transformer.dtype
    
    import numpy as np
    import torch
    
    image = init_image.convert("RGB")
    image_np = np.array(image).astype(np.float32) / 255.0
    image_tensor = torch.from_numpy(image_np).permute(2, 0, 1).unsqueeze(0).to(device, dtype=pipe.vae.dtype)
    image_tensor = image_tensor * 2.0 - 1.0
    try:
        scale = pipe.vae.config.get("scaling_factor", 0.13025) if hasattr(pipe.vae.config, "get") else getattr(pipe.vae.config, "scaling_factor", 0.13025)
        shift = pipe.vae.config.get("shift_factor", 0.0) if hasattr(pipe.vae.config, "get") else getattr(pipe.vae.config, "shift_factor", 0.0)
        latents = pipe.vae.encode(image_tensor).latent_dist.sample(generator=generator)
        if hasattr(pipe.vae.config, "latents_mean") and getattr(pipe.vae.config, "latents_mean", None) is not None:
            l_mean = torch.tensor(pipe.vae.config.latents_mean).to(latents.device, latents.dtype)
            l_std = torch.tensor(pipe.vae.config.latents_std).to(latents.device, latents.dtype)
            for _ in range(latents.ndim - 2):
                l_mean = l_mean.unsqueeze(-1)
                l_std = l_std.unsqueeze(-1)
            latents = (latents - l_mean) / l_std
        else:
            latents = (latents - shift) * scale
    except Exception as e:
        if "expected 5" in str(e) or "5D" in str(e):
            image_tensor = image_tensor.unsqueeze(2)
            scale = pipe.vae.config.get("scaling_factor", 0.13025) if hasattr(pipe.vae.config, "get") else getattr(pipe.vae.config, "scaling_factor", 0.13025)
            shift = pipe.vae.config.get("shift_factor", 0.0) if hasattr(pipe.vae.config, "get") else getattr(pipe.vae.config, "shift_factor", 0.0)
            latents = pipe.vae.encode(image_tensor).latent_dist.sample(generator=generator)
            if hasattr(pipe.vae.config, "latents_mean") and getattr(pipe.vae.config, "latents_mean", None) is not None:
                l_mean = torch.tensor(pipe.vae.config.latents_mean).to(latents.device, latents.dtype)
                l_std = torch.tensor(pipe.vae.config.latents_std).to(latents.device, latents.dtype)
                for _ in range(latents.ndim - 2):
                    l_mean = l_mean.unsqueeze(-1)
                    l_std = l_std.unsqueeze(-1)
                latents = (latents - l_mean) / l_std
            else:
                latents = (latents - shift) * scale
        else:
            raise e
    
    clean_latents = latents.clone()
    
    mask_tensor = None
    if mask_image is not None:
        mask_np = np.array(mask_image.convert("L")).astype(np.float32) / 255.0
        mask_tensor = torch.from_numpy(mask_np).unsqueeze(0).unsqueeze(0).to(device, dtype=transformer_dtype)
        import torch.nn.functional as F
        if latents.ndim == 5:
            mask_tensor = mask_tensor.unsqueeze(2)
            mask_tensor = F.interpolate(mask_tensor, size=(latents.shape[2], latents.shape[3], latents.shape[4]), mode="nearest")
        else:
            mask_tensor = F.interpolate(mask_tensor, size=(latents.shape[2], latents.shape[3]), mode="nearest")
    
    pipe.scheduler.set_timesteps(num_inference_steps, device=device)
    timesteps = pipe.scheduler.timesteps
    
    init_step = int(num_inference_steps * (1 - strength))
    init_step = max(0, min(init_step, num_inference_steps - 1))
    timesteps = timesteps[init_step:]
    
    noise = torch.randn_like(latents, generator=generator)
    if hasattr(pipe.scheduler, "scale_noise"):
        latent_timestep = timesteps[:1].repeat(latents.shape[0])
        latents = pipe.scheduler.scale_noise(latents, latent_timestep, noise)
    else:
        sigma = pipe.scheduler.sigmas[init_step]
        latents = latents * (1.0 - sigma) + noise * sigma
        
    prompt_embeds, negative_prompt_embeds = pipe.encode_prompt(
        prompt=prompt, negative_prompt=negative_prompt, do_classifier_free_guidance=True, 
        num_images_per_prompt=1, device=device
    )
    
    padding_mask = latents.new_zeros(1, 1, latents.shape[-2], latents.shape[-1], dtype=transformer_dtype)
    
    with pipe.progress_bar(total=len(timesteps)) as progress_bar:
        for i, t in enumerate(timesteps):
            sigma = pipe.scheduler.sigmas[i + init_step]
            timestep = sigma.expand(latents.shape[0]).to(transformer_dtype)
            
            latent_model_input = latents.to(transformer_dtype)
            velocity = pipe.transformer(
                hidden_states=latent_model_input, timestep=timestep,
                encoder_hidden_states=prompt_embeds, padding_mask=padding_mask, return_dict=False
            )[0].float()
            
            velocity_uncond = pipe.transformer(
                hidden_states=latent_model_input, timestep=timestep,
                encoder_hidden_states=negative_prompt_embeds, padding_mask=padding_mask, return_dict=False
            )[0].float()
            velocity = velocity_uncond + guidance_scale * (velocity - velocity_uncond)
            
            latents = pipe.scheduler.step(velocity, t, latents, return_dict=False)[0]
            
            if mask_tensor is not None:
                if (i + 1) < len(timesteps):
                    if hasattr(pipe.scheduler, "scale_noise"):
                        next_t = timesteps[i + 1]
                        latent_timestep_next = next_t.repeat(latents.shape[0]).to(device) if next_t.dim() == 0 else next_t.clone().detach().to(device).repeat(latents.shape[0])
                        bg_at_next = pipe.scheduler.scale_noise(clean_latents, latent_timestep_next, noise)
                    else:
                        sigma_next = pipe.scheduler.sigmas[i + init_step + 1] if (i + init_step + 1) < len(pipe.scheduler.sigmas) else 0.0
                        bg_at_next = clean_latents * (1.0 - sigma_next) + noise * sigma_next
                else:
                    bg_at_next = clean_latents
                    
                latents = latents * mask_tensor + bg_at_next * (1.0 - mask_tensor)
                
            progress_bar.update()
            
    scale_dec = pipe.vae.config.get("scaling_factor", 0.13025) if hasattr(pipe.vae.config, "get") else getattr(pipe.vae.config, "scaling_factor", 0.13025)
    shift_dec = pipe.vae.config.get("shift_factor", 0.0) if hasattr(pipe.vae.config, "get") else getattr(pipe.vae.config, "shift_factor", 0.0)
    latents = (latents / scale_dec) + shift_dec
    if hasattr(pipe.vae.config, "latents_mean") and pipe.vae.config.latents_mean is not None:
        latents_mean = torch.tensor(pipe.vae.config.latents_mean).to(latents.device, latents.dtype)
        latents_std = torch.tensor(pipe.vae.config.latents_std).to(latents.device, latents.dtype)
        for _ in range(latents.ndim - 2):
            latents_mean = latents_mean.unsqueeze(-1)
            latents_std = latents_std.unsqueeze(-1)
        latents = latents / latents_std + latents_mean
        
    image = pipe.vae.decode(latents.to(pipe.vae.dtype), return_dict=False)[0]
    
    if hasattr(pipe, "image_processor"):
        image = pipe.image_processor.postprocess(image, output_type="pil")
        final_pil = image[0]
    elif hasattr(pipe, "video_processor"):
        video = pipe.video_processor.postprocess_video(image, output_type="pil")
        final_pil = video[0][0]
    else:
        image = (image / 2 + 0.5).clamp(0, 1)
        image = image.cpu().permute(0, 2, 3, 1).float().numpy()
        import PIL
        final_pil = PIL.Image.fromarray((image[0] * 255).astype(np.uint8))
        
    if mask_image is not None:
        import PIL
        mask_image_resized = mask_image.convert("L").resize(final_pil.size, PIL.Image.Resampling.LANCZOS)
        orig_image_resized = init_image.convert("RGB").resize(final_pil.size, PIL.Image.Resampling.LANCZOS)
        final_pil = PIL.Image.composite(final_pil, orig_image_resized, mask_image_resized)
        
    return final_pil

def _do_img2img(req: Img2ImgRequest):
    _switch_model_if_needed(req.base_model, req.civitai_api_key)
    is_inpaint = req.mask is not None and len(req.mask) > 10
    active_pipe = pipe_inpaint if is_inpaint else pipe_img2img
    is_anima = globals().get("CURRENT_ARCHITECTURE") == "Anima" or "anima" in str(req.base_model).lower()
    if not active_pipe and not is_anima: raise HTTPException(status_code=400, detail="This feature is not supported on this model architecture yet.")
    seed = req.seed if (req.seed is not None and req.seed >= 0) else int(torch.randint(0, 2**32, (1,)).item())
    generator = torch.Generator("cuda").manual_seed(seed)
    init_image = _decode_base64_image(req.init_images[0]).resize((req.width, req.height), PIL.Image.LANCZOS)
    warnings = []
    loaded_adapters , manual_fused = _apply_loras(active_pipe, req.loras, req.civitai_api_key, warnings)
    is_pony = "pony" in str(req.base_model).lower() or "pony" in str(globals().get("CURRENT_BASE_MODEL_FILE", "")).lower()
    if is_pony:
        prompt_str = req.prompt if "score_" in req.prompt else f"score_9, score_8_up, score_7_up, source_anime, {req.prompt}"
        neg_prompt_str = req.negative_prompt if req.negative_prompt and "score_" in req.negative_prompt else f"score_4, score_5, score_6, score_4_up, score_5_up, score_6_up, rating_explicit, {req.negative_prompt or ''}"
    else:
        prompt_str = req.prompt
        neg_prompt_str = req.negative_prompt

    with torch.inference_mode():
        kwargs = dict(prompt=prompt_str, negative_prompt=neg_prompt_str, image=init_image, strength=req.denoising_strength, num_inference_steps=req.steps, guidance_scale=req.cfg_scale, generator=generator)
        if is_inpaint:
            mask_img = _decode_base64_image(req.mask).resize((req.width, req.height), PIL.Image.LANCZOS)
            kwargs['mask_image'] = mask_img
        
        if is_anima:
            if is_inpaint:
                image = _anima_img2img(pipe, prompt_str, neg_prompt_str, init_image, req.denoising_strength, req.steps, req.cfg_scale, generator, mask_image=mask_img)
            else:
                image = _anima_img2img(pipe, prompt_str, neg_prompt_str, init_image, req.denoising_strength, req.steps, req.cfg_scale, generator, mask_image=None)
        else:
            image = active_pipe(**kwargs).images[0]
    if loaded_adapters:
        try: active_pipe.delete_adapters(loaded_adapters)
        except: pass
    return {"images": [_encode_image_to_base64(image)], "source": f"Google Colab Cloud GPU ({torch.cuda.get_device_name(0)})", "warnings": warnings}
@app.post("/sdapi/v1/img2img")
def img2img(req: Img2ImgRequest):
    task_id = str(uuid.uuid4())
    tasks[task_id] = {"status": "processing"}
    threading.Thread(target=_bg_runner, args=(task_id, _do_img2img, req)).start()
    return {"task_id": task_id}

def _do_interrogate(req: InterrogateRequest):
    _load_clip()
    image = _decode_base64_image(req.image)
    inputs = _clip_preprocess(image, return_tensors="pt").to("cuda", torch.float16)
    with torch.no_grad():
        out = _clip_model.generate(**inputs, max_new_tokens=50)
    caption = _clip_preprocess.decode(out[0], skip_special_tokens=True)
    _unload_clip()
    return {"caption": caption}

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
    result_image = PIL.Image.fromarray(output[:, :, ::-1])
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
    result_image = PIL.Image.fromarray(output[:, :, ::-1])
    _unload_face_restorer()
    return {"images": [_encode_image_to_base64(result_image)], "source": req.engine}

def _do_adetailer(req: FaceFixRequest):
    global pipe_inpaint
    if req.base_model:
        _switch_model_if_needed(req.base_model, req.civitai_api_key)
    try:
        from ultralytics import YOLO
        import PIL.ImageDraw, PIL.ImageFilter
    except ImportError:
        return _do_face_fix(req)
        
    model_path = "/kaggle/working/Models/yolov8n-face.pt"
    if not os.path.exists(model_path):
        return _do_face_fix(req)
        
    model = YOLO(model_path)
    image = _decode_base64_image(req.image)
    
    results = model(image)
    boxes = results[0].boxes.xyxy.cpu().numpy()
    
    if len(boxes) == 0:
        return _do_face_fix(req)
        
    mask = PIL.Image.new("L", image.size, 0)
    draw = PIL.ImageDraw.Draw(mask)
    for box in boxes:
        x1, y1, x2, y2 = box
        w, h = x2 - x1, y2 - y1
        px, py = w * 0.15, h * 0.15
        draw.rectangle([max(0, x1 - px), max(0, y1 - py), min(image.width, x2 + px), min(image.height, y2 + py)], fill=255)
        
    mask = mask.filter(PIL.ImageFilter.GaussianBlur(15))
    
    if 'pipe_inpaint' not in globals() or pipe_inpaint is None:
        return _do_face_fix(req)
        
    prompt_str = req.prompt if req.prompt else "highly detailed face, perfect eyes, masterpiece"
    neg_prompt_str = "bad anatomy, deformed, ugly, bad eyes, poorly drawn face"
    
    seed = int(torch.randint(0, 2**32, (1,)).item())
    generator = torch.Generator("cuda").manual_seed(seed)
    
    with torch.inference_mode():
        is_anima = globals().get("CURRENT_ARCHITECTURE") == "Anima" or (req.base_model and "anima" in str(req.base_model).lower())
        kwargs = dict(prompt=prompt_str, negative_prompt=neg_prompt_str, image=image, mask_image=mask, num_inference_steps=30, guidance_scale=7.0, strength=0.4, generator=generator)
        if is_anima:
            from diffusers import StableDiffusion3InpaintPipeline
            if "anima_inpaint_pipe" not in globals():
                global anima_inpaint_pipe
                anima_inpaint_pipe = StableDiffusion3InpaintPipeline(**pipe.components)
            result_img = anima_inpaint_pipe(**kwargs).images[0]
        else:
            result_img = pipe_inpaint(**kwargs).images[0]
        
    return {"images": [_encode_image_to_base64(result_img)], "source": "ADetailer"}

@app.post("/sdapi/v1/face-fix")
def face_fix(req: FaceFixRequest):
    task_id = str(uuid.uuid4())
    tasks[task_id] = {"status": "processing"}
    target_func = _do_adetailer if req.engine == "ADetailer" else _do_face_fix
    threading.Thread(target=_bg_runner, args=(task_id, target_func, req)).start()
    return {"task_id": task_id}

threading.Thread(target=lambda: uvicorn.run(app, host="0.0.0.0", port=8000, log_level="warning"), daemon=True).start()
time.sleep(2)
import os
os.system("pkill -f cloudflared")
time.sleep(2)
try:
    tunnel = try_cloudflare(port=8000)
    print(f"\n🎉 COPY THIS URL: {tunnel.tunnel}\n")
except Exception as e:
    print("Cloudflared failed. Trying alternative tunnel (LocalTunnel)...")
    import subprocess
    os.system("npm install -g localtunnel > /dev/null 2>&1")
    p = subprocess.Popen(["lt", "--port", "8000"], stdout=subprocess.PIPE)
    url = p.stdout.readline().decode().strip().split("is: ")[1]
    print(f"\n🎉 COPY THIS URL: {url}\n")
    print("⚠️ NOTE: LocalTunnel requires you to enter the Colab IP on first visit.")
    print("Go to this URL to find your Colab IP: https://ipv4.icanhazip.com/")
