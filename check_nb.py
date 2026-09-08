import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('colab_server.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for i, cell in enumerate(nb.get("cells", [])):
    if cell.get("cell_type") == "code":
        src = ''.join(cell['source'])
        if '_switch_model_if_needed' in src and 'def _switch_model_if_needed' in src:
            print(f"=== Cell {i}: _switch_model_if_needed ===")
            in_func = False
            for line in cell['source']:
                if 'def _switch_model_if_needed' in line:
                    in_func = True
                if in_func:
                    print(line.rstrip())
                if in_func and 'CURRENT_BASE_MODEL_FILE = req_base_model_file' in line:
                    print()
                    break
