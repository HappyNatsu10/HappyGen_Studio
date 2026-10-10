import json
import os

def unpatch_compile():
    for nb_file in ['colab_server.ipynb', 'kaggle_server.ipynb']:
        if not os.path.exists(nb_file): continue
        with open(nb_file, 'r', encoding='utf-8') as f:
            nb = json.load(f)
        
        changed = False
        for cell in nb.get('cells', []):
            if cell.get('cell_type') != 'code': continue
            src = cell.get('source', [])
            new_src = []
            for line in src:
                if 'pipe.transformer = torch.compile' in line:
                    changed = True
                    continue # Skip this line
                new_src.append(line)
            cell['source'] = new_src
            
        if changed:
            with open(nb_file, 'w', encoding='utf-8') as f:
                json.dump(nb, f, indent=2)
            print(f"Removed torch.compile from {nb_file}")

if __name__ == "__main__":
    unpatch_compile()
