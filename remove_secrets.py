import json
import re

def remove_secrets(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        d = json.load(f)

    changed = False
    for cell in d['cells']:
        if cell['cell_type'] != 'code': continue
        
        source = ''.join(cell['source'])
        original_source = source
        
        # Remove import
        source = re.sub(r'from google\.colab import userdata\n?', '', source)
        
        # Remove the nested try/except block that gets the CIVITAI_API_KEY
        # Since it might vary slightly, we can use a regex that matches the whole try-except userdata block
        pattern = r'try:\s*try:\s*try:\s*CIVITAI_API_KEY = userdata\.get\(\'CIVITAI_API_KEY\'\).*?except Exception:\s*CIVITAI_API_KEY = None'
        source = re.sub(pattern, 'CIVITAI_API_KEY = None', source, flags=re.DOTALL)
        
        # Another pattern for the fast api block where it might be:
        pattern2 = r'CIVITAI_API_KEY = None\s*try:\s*try:\s*try:\s*CIVITAI_API_KEY = userdata\.get\(\'CIVITAI_API_KEY\'\).*?except:\s*pass'
        source = re.sub(pattern2, 'CIVITAI_API_KEY = None', source, flags=re.DOTALL)

        if source != original_source:
            cell['source'] = [line + ('\n' if i < len(source.split('\n')) - 1 else '') for i, line in enumerate(source.split('\n'))]
            changed = True

    if changed:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(d, f, indent=2)
        print(f"Removed secrets popup from {filename}")

remove_secrets('colab_server.ipynb')
remove_secrets('kaggle_server.ipynb')
