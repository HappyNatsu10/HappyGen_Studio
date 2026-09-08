import json
import re

def fix_notebook():
    with open('colab_server.ipynb', 'r', encoding='utf-8') as f:
        nb = json.load(f)

    for cell in nb['cells']:
        if cell.get('cell_type') != 'code':
            continue
            
        src = "".join(cell['source'])
        
        # The previous fix left hanging spaces which caused indentation errors.
        # We will look for lines that consist only of spaces and remove them, 
        # or fix the specific indentation error.
        
        # Let's just fix the double spaces
        src = re.sub(r'\n[ \t]+\n', '\n', src)
        
        # More specifically, if there's a line with just spaces followed by pipe.scheduler, it might be on the same line
        # e.g., "                                pipe.scheduler..."
        src = re.sub(r' +pipe\.scheduler =', '                pipe.scheduler =', src)
        src = re.sub(r' +pipe_img2img =', '                pipe_img2img =', src)
        
        # Fix the try/except blocks indentation inside _switch_model_if_needed
        # Let's ensure standard indentation for the pipeline assignments
        src = src.replace('                                pipe.scheduler =', '                pipe.scheduler =')
        src = src.replace('                                    pipe.scheduler =', '                    pipe.scheduler =')
        
        cell['source'] = [line + '\n' for line in src.split('\n')]
        
        # Strip the trailing newline that split('\n') adds if the original didn't have it
        if not src.endswith('\n'):
            cell['source'][-1] = cell['source'][-1].rstrip('\n')
        if not cell['source'][-1]:
            cell['source'].pop()

    with open('colab_server.ipynb', 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)
    print("Notebook saved.")

if __name__ == '__main__':
    fix_notebook()
