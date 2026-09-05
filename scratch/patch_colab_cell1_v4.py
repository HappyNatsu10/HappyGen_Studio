import json

with open('colab_server.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code' and len(cell['source']) > 0 and 'Cell 1: Install Dependencies' in cell['source'][0]:
        # Reset to known good state
        cell['source'] = [
            "# Cell 1: Install Dependencies\n",
            "!pip install -q diffusers transformers accelerate safetensors sentencepiece protobuf fastapi uvicorn pydantic pycloudflared nest_asyncio python-multipart peft open_clip_torch\n",
            "!rm -rf BasicSR\n",
            "!git clone https://github.com/xinntao/BasicSR.git\n",
            "!cd BasicSR && sed -i 's/return locals().*/return \"1.4.2\"/g' setup.py && pip install -q .\n",
            "!python -c \"import sys; sys.path.append('/usr/local/lib/python3.10/dist-packages'); import basicsr.data.degradations as d; open(d.__file__, 'w').write(open(d.__file__).read().replace('from torchvision.transforms.functional_tensor import rgb_to_grayscale', 'from torchvision.transforms.functional import rgb_to_grayscale'))\"\n",
            "!pip install -q facexlib realesrgan gfpgan\n"
        ]
        break

with open('colab_server.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
