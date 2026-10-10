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
        
        # 1. Remove _bg_runner and async_status completely
        if "def _bg_runner(task_id, func, *args, **kwargs):" in src:
            src = re.sub(r'async_tasks\s*=\s*\{\}\n*', '', src)
            src = re.sub(r'def _bg_runner[\s\S]*?(?=@app|$)', '', src)
            src = re.sub(r'@app\.get\("/async/status/\{task_id\}"\)[\s\S]*?(?=@app|def _load_clip|$)', '', src)
            changed_cell = True

        # 2. Patch each endpoint
        endpoints = [
            ("txt2img", "_do_txt2img", "Txt2ImgRequest"),
            ("img2img", "_do_img2img", "Img2ImgRequest"),
            ("interrogate", "_do_interrogate", "InterrogateRequest"),
            ("upscale", "_do_upscale", "UpscaleRequest"),
            ("face_fix", "_do_face_fix", "FaceFixRequest"),
        ]
        
        for ep_name, func_name, req_type in endpoints:
            old_pattern = rf'@app\.post\(".+?{ep_name}"\)\s*\n\s*def {ep_name}\(req: {req_type}\):\s*\n\s*task_id\s*=\s*str\(uuid\.uuid4\(\)\)\s*\n\s*tasks\[task_id\]\s*=\s*\{{"status": "processing"\}}\s*\n\s*threading\.Thread\(target=_bg_runner, args=\(task_id, {func_name}, req\)\)\.start\(\)\s*\n\s*return \{{"task_id": task_id\}}'
            
            # Wait, `tasks` was renamed to `async_tasks` in some files! Let's be less strict with regex.
            loose_pattern = rf'@app\.post\(".+?{ep_name}"\)\s*\n\s*def {ep_name}\(req: {req_type}\):[\s\S]*?return \{{"task_id": task_id\}}'
            new_code = f'@app.post("/sdapi/v1/{ep_name.replace("_", "-")}")\ndef {ep_name}(req: {req_type}):\n    return {func_name}(req)'
            
            # exception for interrogate which uses /sdapi/v1/interrogate and upscale which uses /sdapi/v1/extra-single-image
            if ep_name == "upscale":
                new_code = f'@app.post("/sdapi/v1/extra-single-image")\ndef {ep_name}(req: {req_type}):\n    return {func_name}(req)'
            elif ep_name == "txt2img":
                new_code = f'@app.post("/sdapi/v1/txt2img")\ndef {ep_name}(req: {req_type}):\n    return {func_name}(req)'
            elif ep_name == "img2img":
                new_code = f'@app.post("/sdapi/v1/img2img")\ndef {ep_name}(req: {req_type}):\n    return {func_name}(req)'
            elif ep_name == "interrogate":
                new_code = f'@app.post("/sdapi/v1/interrogate")\ndef {ep_name}(req: {req_type}):\n    return {func_name}(req)'
            
            if re.search(loose_pattern, src):
                src = re.sub(loose_pattern, new_code, src)
                changed_cell = True

        if changed_cell:
            cell['source'] = [line + '\n' for line in src.split('\n')]
            if cell['source']: cell['source'][-1] = cell['source'][-1].rstrip('\n')
            
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1)
    print(f'Patched sync routes into {path}')

for p in glob.glob('*_server.ipynb'):
    process_notebook(p)
