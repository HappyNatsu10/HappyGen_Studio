import json

with open('colab_server.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code' and len(cell['source']) > 0 and 'Cell 1: Install Dependencies' in cell['source'][0]:
        for i, line in enumerate(cell['source']):
            if 'pip install -q -e .' in line:
                cell['source'][i] = line.replace('pip install -q -e .', 'pip install -q .')
            if 'sed -i' in line and '/usr/local/lib/python3.10/dist-packages/basicsr' in line:
                # We need a robust way to find degradations.py because python version can change. 
                # Let's use python to find the module and patch it in a single line.
                cell['source'][i] = "!python -c \"import basicsr.data.degradations as d; import os; f = d.__file__; open(f, 'w').write(open(f).read().replace('from torchvision.transforms.functional_tensor import rgb_to_grayscale', 'from torchvision.transforms.functional import rgb_to_grayscale'))\"\n"
            elif 'sed -i' in line and '/content/BasicSR/basicsr/data/degradations.py' in line:
                cell['source'][i] = "!python -c \"import basicsr.data.degradations as d; import os; f = d.__file__; open(f, 'w').write(open(f).read().replace('from torchvision.transforms.functional_tensor import rgb_to_grayscale', 'from torchvision.transforms.functional import rgb_to_grayscale'))\"\n"
        break

with open('colab_server.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
