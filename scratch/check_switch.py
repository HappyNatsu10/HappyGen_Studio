import json
with open('colab_server.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        source = cell['source']
        for i, line in enumerate(source):
            if 'def _switch_model_if_needed(' in line:
                start = max(0, i)
                end = min(len(source), i+40)
                for j in range(start, end):
                    print(f'{j}: {source[j].strip()}')
                break
