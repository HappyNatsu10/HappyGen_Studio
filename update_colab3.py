import json

with open('colab_server.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell['cell_type'] == 'code':
        source = cell['source']
        new_source = []
        i = 0
        while i < len(source):
            line = source[i]
            if 'pipe = StableDiffusionXLPipeline.from_single_file(model_path, config="stabilityai/stable-diffusion-xl-base-1.0"' in line:
                indent = line[:len(line) - len(line.lstrip())]
                new_source.extend([
                    f"{indent}try:\n",
                    f"{indent}    pipe = StableDiffusionXLPipeline.from_single_file(model_path, config=\"stabilityai/stable-diffusion-xl-base-1.0\", torch_dtype=torch.float16, use_safetensors=True, low_cpu_mem_usage=True).to(\"cuda\")\n",
                    f"{indent}except ValueError as e:\n",
                    f"{indent}    if 'CLIPTextModel' in str(e):\n",
                    f"{indent}        from transformers import CLIPTextModel, CLIPTextModelWithProjection\n",
                    f"{indent}        print('Missing text encoders in checkpoint. Loading from base SDXL...')\n",
                    f"{indent}        text_encoder = CLIPTextModel.from_pretrained('stabilityai/stable-diffusion-xl-base-1.0', subfolder='text_encoder', torch_dtype=torch.float16)\n",
                    f"{indent}        text_encoder_2 = CLIPTextModelWithProjection.from_pretrained('stabilityai/stable-diffusion-xl-base-1.0', subfolder='text_encoder_2', torch_dtype=torch.float16)\n",
                    f"{indent}        pipe = StableDiffusionXLPipeline.from_single_file(model_path, text_encoder=text_encoder, text_encoder_2=text_encoder_2, config='stabilityai/stable-diffusion-xl-base-1.0', torch_dtype=torch.float16, use_safetensors=True, low_cpu_mem_usage=True).to('cuda')\n",
                    f"{indent}    else:\n",
                    f"{indent}        raise e\n"
                ])
            else:
                new_source.append(line)
            i += 1
        cell['source'] = new_source

with open('colab_server.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=2, ensure_ascii=False)

print("colab_server.ipynb patched successfully for CLIPTextModel fallback.")
