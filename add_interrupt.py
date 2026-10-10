import json
import glob
import re

def process_notebook(path):
    with open(path, 'r', encoding='utf-8') as f:
        nb = json.load(f)
        
    for cell in nb.get('cells', []):
        if cell.get('cell_type') != 'code': continue
        lines = cell.get('source', [])
        src = "".join(lines)
        changed_cell = False
        
        # 1. Add interrupt global flag and endpoint
        if "app = FastAPI()" in src and "shared_interrupt_flag = False" not in src:
            src = src.replace("app = FastAPI()", "app = FastAPI()\n\nshared_interrupt_flag = False\n\n@app.post(\"/sdapi/v1/interrupt\")\ndef interrupt():\n    global shared_interrupt_flag\n    shared_interrupt_flag = True\n    return {\"success\": True}\n")
            changed_cell = True

        # 2. Add callback to standard txt2img kwargs
        if "kwargs = dict(" in src and "def txt2img(req" not in src: # wait, kwargs is in _do_txt2img and _do_img2img
            
            # For _do_txt2img
            if "def _do_txt2img" in src and "shared_interrupt_flag" not in src:
                # Insert at start of _do_txt2img
                src = src.replace("def _do_txt2img(req: Txt2ImgRequest):", "def _do_txt2img(req: Txt2ImgRequest):\n    global shared_interrupt_flag\n    shared_interrupt_flag = False")
                
                # Insert callback into kwargs if using diffusers
                kwargs_old = "kwargs = dict("
                kwargs_new = "def interrupt_callback(pipe, step, timestep, cb_kwargs):\n                if shared_interrupt_flag:\n                    pipe._interrupt = True\n                return cb_kwargs\n            \n            kwargs = dict(callback_on_step_end=interrupt_callback, "
                if kwargs_old in src:
                    # just replace the first one in the function
                    src = src.replace(kwargs_old, kwargs_new, 1)
                changed_cell = True

        # For _do_img2img (Standard diffusers fallback)
        if "def _do_img2img" in src and "shared_interrupt_flag = False" not in src:
            src = src.replace("def _do_img2img(req: Img2ImgRequest):", "def _do_img2img(req: Img2ImgRequest):\n    global shared_interrupt_flag\n    shared_interrupt_flag = False")
            
            kwargs_old = "kwargs = dict(prompt=prompt_str"
            kwargs_new = "def interrupt_callback(pipe, step, timestep, cb_kwargs):\n                if shared_interrupt_flag:\n                    pipe._interrupt = True\n                return cb_kwargs\n            \n            kwargs = dict(callback_on_step_end=interrupt_callback, prompt=prompt_str"
            src = src.replace(kwargs_old, kwargs_new, 1)
            changed_cell = True
            
        # 3. Add check to Anima loop
        if "def _anima_img2img" in src:
            loop_old = "        for i, t in enumerate(timesteps):"
            loop_new = "        for i, t in enumerate(timesteps):\n            if globals().get('shared_interrupt_flag', False):\n                break"
            if loop_old in src and "shared_interrupt_flag" not in src:
                src = src.replace(loop_old, loop_new)
                changed_cell = True

        if changed_cell:
            cell['source'] = [line + '\n' for line in src.split('\n')]
            if cell['source']: cell['source'][-1] = cell['source'][-1].rstrip('\n')
            
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1)
    print(f'Patched interrupt logic into {path}')

for p in glob.glob('*_server.ipynb'):
    process_notebook(p)
