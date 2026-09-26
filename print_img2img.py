import json
with open('colab_server.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)
for cell in nb.get('cells', []):
    if cell['cell_type'] == 'code':
        for i, line in enumerate(cell['source']):
            if 'def _do_img2img' in line:
                print("".join(cell['source'][i:i+40]))
                break
