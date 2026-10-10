import json

with open('colab_server.ipynb', 'r', encoding='utf-8') as f:
    d = json.load(f)

new_cells = []
for cell in d['cells']:
    if 'source' not in cell:
        new_cells.append(cell)
        continue
        
    source = ''.join(cell['source'])
    
    # Replace Colab specific paths with Kaggle
    source = source.replace('/content', '/kaggle/working')
    
    # Remove lines containing google.colab
    lines = source.split('\n')
    new_lines = []
    for line in lines:
        if 'google.colab' in line:
            continue
        new_lines.append(line)
        
    cell['source'] = [line + ('\n' if i < len(new_lines) - 1 else '') for i, line in enumerate(new_lines)]
    
    # Optional: We could skip cells that are purely google.colab drive mounting, but the above removes the code.
    if len(cell['source']) > 0 or cell.get('cell_type') != 'code':
        new_cells.append(cell)

d['cells'] = new_cells

with open('kaggle_server.ipynb', 'w', encoding='utf-8') as f:
    json.dump(d, f, indent=2)

print("Created kaggle_server.ipynb")
