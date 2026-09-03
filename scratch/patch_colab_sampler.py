import json

with open('colab_server.ipynb', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('"    seed: Optional[int] = -1\\n",', '"    seed: Optional[int] = -1\\n",\n    "    sampler_name: Optional[str] = \\"Euler a\\"\\n",')

sampler_func = """    def _apply_sampler(target_pipe, sampler_name):
        if not sampler_name or "Flux" in str(type(target_pipe)): return
        from diffusers import (EulerAncestralDiscreteScheduler, EulerDiscreteScheduler, DPMSolverMultistepScheduler, DPMSolverSinglestepScheduler, UniPCMultistepScheduler, DDIMScheduler, LMSDiscreteScheduler, PNDMScheduler)
        cfg = target_pipe.scheduler.config
        if sampler_name == "Euler a": target_pipe.scheduler = EulerAncestralDiscreteScheduler.from_config(cfg)
        elif sampler_name == "DPM++ 2M Karras": target_pipe.scheduler = DPMSolverMultistepScheduler.from_config(cfg, use_karras_sigmas=True)
        elif sampler_name == "DPM++ SDE Karras": target_pipe.scheduler = DPMSolverSinglestepScheduler.from_config(cfg, use_karras_sigmas=True)
        elif sampler_name == "Euler": target_pipe.scheduler = EulerDiscreteScheduler.from_config(cfg)
        elif sampler_name == "UniPC": target_pipe.scheduler = UniPCMultistepScheduler.from_config(cfg)
        elif sampler_name == "DDIM": target_pipe.scheduler = DDIMScheduler.from_config(cfg)
        elif sampler_name == "LMS Karras": target_pipe.scheduler = LMSDiscreteScheduler.from_config(cfg, use_karras_sigmas=True)
        elif sampler_name == "PNDM": target_pipe.scheduler = PNDMScheduler.from_config(cfg)

"""

# json dump format of the function
sampler_func_json = "".join(['    "{}\\n",\n'.format(line.replace('"', '\\"')) for line in sampler_func.split('\n')])


text = text.replace('"def _do_txt2img(req: Txt2ImgRequest):\\n",', sampler_func_json + '    "def _do_txt2img(req: Txt2ImgRequest):\\n",')
text = text.replace('"    loaded_adapters = _apply_loras(pipe, req.loras, req.civitai_api_key)\\n",', '"    loaded_adapters = _apply_loras(pipe, req.loras, req.civitai_api_key)\\n",\n    "    _apply_sampler(pipe, getattr(req, \\"sampler_name\\", \\"Euler a\\"))\\n",')
text = text.replace('"    loaded_adapters = _apply_loras(pipe_img2img, req.loras, req.civitai_api_key)\\n",', '"    loaded_adapters = _apply_loras(pipe_img2img, req.loras, req.civitai_api_key)\\n",\n    "    _apply_sampler(pipe_img2img, getattr(req, \\"sampler_name\\", \\"Euler a\\"))\\n",')

with open('colab_server.ipynb', 'w', encoding='utf-8') as f:
    f.write(text)
