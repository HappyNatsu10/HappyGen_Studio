import json
import glob

def clean_notebook(path):
    with open(path, 'r', encoding='utf-8') as f:
        nb = json.load(f)
    changed = False
    for cell in nb.get('cells', []):
        if cell.get('cell_type') != 'code': continue
        new_source = []
        for line in cell.get('source', []):
            if '"anima" in str(req.base_model).lower()' in line and 'animagine' not in line:
                new_line = line.replace('"anima" in str(req.base_model).lower()', '("anima" in str(req.base_model).lower() and "animagine" not in str(req.base_model).lower())')
                new_source.append(new_line)
                changed = True
            else:
                new_source.append(line)
        cell['source'] = new_source
    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(nb, f, indent=1)
        print(f'Cleaned {path}')

for nb in glob.glob('*_server.ipynb'):
    clean_notebook(nb)
