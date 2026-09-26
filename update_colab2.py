import json

with open('colab_server.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell['cell_type'] == 'code':
        source = cell['source']
        new_source = []
        for line in source:
            if 'CIVITAI_API_KEY = userdata.get' in line:
                # Replace with a safe block
                indent = line[:len(line) - len(line.lstrip())]
                new_source.extend([
                    f"{indent}try:\n",
                    f"{indent}    CIVITAI_API_KEY = userdata.get('CIVITAI_API_KEY')\n",
                    f"{indent}except Exception:\n",
                    f"{indent}    CIVITAI_API_KEY = ''\n"
                ])
            else:
                new_source.append(line)
        cell['source'] = new_source

with open('colab_server.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=2, ensure_ascii=False)

print("colab_server.ipynb patched successfully for safe userdata access.")
