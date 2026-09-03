import json
with open('colab_server.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code':
        source = cell['source']
        new_source = []
        for line in source:
            if line.startswith('    def _apply_sampler'):
                new_source.append(line[4:])
            elif line.startswith('        if not sampler_name') and 'Flux' in line:
                new_source.append(line[4:])
            elif line.startswith('        from diffusers'):
                new_source.append(line[4:])
            elif line.startswith('        cfg = target_pipe.scheduler.config'):
                new_source.append(line[4:])
            elif line.startswith('        if sampler_name == "Euler a"'):
                new_source.append(line[4:])
            elif line.startswith('        elif sampler_name == '):
                new_source.append(line[4:])
            else:
                new_source.append(line)
        cell['source'] = new_source

with open('colab_server.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
