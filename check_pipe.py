import json
with open('colab_server.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)
for cell in nb.get('cells', []):
    if cell['cell_type'] == 'code':
        for line in cell['source']:
            if 'pipe_img2img =' in line or 'pipe_inpaint =' in line:
                print(line)
