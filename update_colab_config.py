import json

with open('colab_server.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell['cell_type'] == 'code':
        source = cell['source']
        new_source = []
        for line in source:
            if 'config="stabilityai/stable-diffusion-xl-base-1.0", ' in line:
                line = line.replace('config="stabilityai/stable-diffusion-xl-base-1.0", ', '')
            elif "config='stabilityai/stable-diffusion-xl-base-1.0', " in line:
                line = line.replace("config='stabilityai/stable-diffusion-xl-base-1.0', ", '')
            new_source.append(line)
        cell['source'] = new_source

with open('colab_server.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=2, ensure_ascii=False)
