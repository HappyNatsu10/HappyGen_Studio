import json

def fix_notebook():
    with open('colab_server.ipynb', 'r', encoding='utf-8') as f:
        nb = json.load(f)

    txt2img_old = """        with torch.inference_mode():
            image = pipe(**kwargs, num_inference_steps=req.steps, guidance_scale=req.cfg_scale, width=req.width, height=req.height, generator=generator).images[0]"""

    txt2img_new = """        try:
            with torch.inference_mode():
                image = pipe(**kwargs, num_inference_steps=req.steps, guidance_scale=req.cfg_scale, width=req.width, height=req.height, generator=generator).images[0]
        except Exception as pipe_err:
            pe_type = type(kwargs.get('pooled_prompt_embeds'))
            pe_val = kwargs.get('pooled_prompt_embeds') is None
            raise RuntimeError(f"PIPE CRASH! kwargs keys: {list(kwargs.keys())}. pooled type: {pe_type}. Is it None? {pe_val}. Original error: {pipe_err}")"""

    img2img_old = """        with torch.inference_mode():
            image = pipe_img2img(**kwargs, image=init_image, strength=req.denoising_strength, num_inference_steps=req.steps, guidance_scale=req.cfg_scale, generator=generator).images[0]"""

    img2img_new = """        try:
            with torch.inference_mode():
                image = pipe_img2img(**kwargs, image=init_image, strength=req.denoising_strength, num_inference_steps=req.steps, guidance_scale=req.cfg_scale, generator=generator).images[0]
        except Exception as pipe_err:
            pe_type = type(kwargs.get('pooled_prompt_embeds'))
            pe_val = kwargs.get('pooled_prompt_embeds') is None
            raise RuntimeError(f"PIPE CRASH! kwargs keys: {list(kwargs.keys())}. pooled type: {pe_type}. Is it None? {pe_val}. Original error: {pipe_err}")"""

    for cell in nb['cells']:
        if cell.get('cell_type') != 'code':
            continue
            
        src = "".join(cell['source'])
        
        if txt2img_old in src:
            src = src.replace(txt2img_old, txt2img_new)
            print("Patched _do_txt2img debug")
            
        if img2img_old in src:
            src = src.replace(img2img_old, img2img_new)
            print("Patched _do_img2img debug")
                
        cell['source'] = [line + '\n' for line in src.split('\n')]
        if not src.endswith('\n'):
            cell['source'][-1] = cell['source'][-1].rstrip('\n')
        if not cell['source'][-1]:
            cell['source'].pop()

    with open('colab_server.ipynb', 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=1, ensure_ascii=False)
    print("Notebook saved.")

if __name__ == '__main__':
    fix_notebook()
