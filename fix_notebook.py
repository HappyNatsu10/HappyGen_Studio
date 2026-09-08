import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('colab_server.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for i, cell in enumerate(nb['cells']):
    if cell.get('cell_type') == 'code':
        src = ''.join(cell['source'])
        
        # Fix Cell 3: Don't pre-load the model, just set up globals
        if 'Cell 3: Load Model' in src:
            cell['source'] = [
                "# Cell 3: Prepare GPU (model loads on first request)\n",
                "import torch\n",
                "from diffusers import StableDiffusionXLPipeline, StableDiffusionXLImg2ImgPipeline, EulerAncestralDiscreteScheduler\n",
                "\n",
                "print(f\"🚀 GPU ready: {torch.cuda.get_device_name(0)} with {torch.cuda.mem_get_info()[0] / (1024**3):.1f} GB free VRAM\")\n",
                "CURRENT_BASE_MODEL_FILE = None\n",
                "pipe = None\n",
                "pipe_img2img = None\n",
                "\n",
                "print(\"✅ Server initialized. Model will load on first generation request.\")\n"
            ]
            print(f"Fixed Cell {i}: Removed pre-load, model loads on first request")

        # Fix Cell 4: Improve _switch_model_if_needed to not use text encoder fallback
        if '_switch_model_if_needed' in src:
            # Replace the from_single_file calls to NOT specify config= 
            # This lets diffusers auto-detect from the safetensors metadata
            # which preserves the model's own text encoders
            old_sdxl_load = 'pipe = StableDiffusionXLPipeline.from_single_file(model_path, config="stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16, use_safetensors=True, low_cpu_mem_usage=True).to("cuda")'
            new_sdxl_load = 'pipe = StableDiffusionXLPipeline.from_single_file(model_path, torch_dtype=torch.float16, use_safetensors=True, low_cpu_mem_usage=True).to("cuda")'
            
            new_source = []
            for line in cell['source']:
                # Fix SDXL load - remove config= to let diffusers auto-detect
                if old_sdxl_load in line:
                    line = line.replace(old_sdxl_load, new_sdxl_load)
                new_source.append(line)
            cell['source'] = new_source
            print(f"Fixed Cell {i}: Removed hardcoded config= from SDXL loading")

with open('colab_server.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1, ensure_ascii=False)

print("\nDone! Changes:")
print("  1. Cell 3: No longer pre-loads default model (saves ~6.5 GB VRAM)")
print("  2. Cell 4: SDXL models load without forced config, preserving their text encoders")
