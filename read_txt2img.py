import json

with open('colab_server.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

lines = [l for c in nb.get('cells', []) if c.get('cell_type') == 'code' for l in c.get('source', [])]

for i, l in enumerate(lines):
    if '@app.post("/sdapi/v1/txt2img")' in l:
        print("".join(lines[i:i+20]))
        break
