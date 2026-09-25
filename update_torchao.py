import json

def patch_notebook(file):
    try:
        with open(file, 'r', encoding='utf-8') as f:
            nb = json.load(f)
        
        changed = False
        for cell in nb.get('cells', []):
            if cell['cell_type'] == 'code':
                new_source = []
                for line in cell['source']:
                    if '!pip install' in line and 'peft' in line:
                        if 'torchao>=0.16.0' not in line:
                            line = line.replace('peft', 'peft torchao>=0.16.0')
                            changed = True
                    new_source.append(line)
                cell['source'] = new_source
                
        if changed:
            with open(file, 'w', encoding='utf-8') as f:
                json.dump(nb, f, indent=2, ensure_ascii=False)
            print(f"{file} patched successfully.")
        else:
            print(f"{file} no changes needed.")
    except Exception as e:
        print(f"Error patching {file}: {e}")

patch_notebook('colab_server.ipynb')
patch_notebook('colab_anima.ipynb')
