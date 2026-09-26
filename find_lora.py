import json

with open('colab_server.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell.get('cell_type') == 'code':
        source = cell['source']
        for i, line in enumerate(source):
            if 'raise ValueError(f"Failed to load LoRA' in line:
                start = max(0, i - 15)
                end = min(len(source), i + 15)
                print("".join(source[start:end]))
