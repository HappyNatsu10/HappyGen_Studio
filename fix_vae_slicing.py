import json

def fix_notebook():
    with open('colab_server.ipynb', 'r', encoding='utf-8') as f:
        nb = json.load(f)

    for cell in nb['cells']:
        if cell.get('cell_type') != 'code':
            continue
            
        src = "".join(cell['source'])
        
        if 'enable_vae_slicing' in src:
            src = src.replace('pipe.enable_vae_slicing()\n', '')
            src = src.replace('pipe.enable_vae_slicing()', '')
            
            cell['source'] = [line + '\n' for line in src.split('\n')][:-1]
            print("Removed enable_vae_slicing")

    with open('colab_server.ipynb', 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)
    print("Notebook saved.")

if __name__ == '__main__':
    fix_notebook()
