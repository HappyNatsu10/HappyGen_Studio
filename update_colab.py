import json

with open('colab_server.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell['cell_type'] == 'code':
        source = cell['source']
        
        # Replace _do_img2img completely
        new_source = []
        in_img2img = False
        for line in source:
            if 'def _do_img2img' in line:
                in_img2img = True
                new_source.extend([
                    "def _do_img2img(req: Img2ImgRequest):\n",
                    "    _switch_model_if_needed(req.base_model, req.civitai_api_key)\n",
                    "    is_inpaint = req.mask is not None and len(req.mask) > 10\n",
                    "    active_pipe = pipe_inpaint if is_inpaint else pipe_img2img\n",
                    "    if not active_pipe: raise HTTPException(status_code=400, detail=\"This feature is not supported on this model architecture yet.\")\n",
                    "    seed = req.seed if (req.seed is not None and req.seed >= 0) else int(torch.randint(0, 2**32, (1,)).item())\n",
                    "    generator = torch.Generator(\"cuda\").manual_seed(seed)\n",
                    "    init_image = _decode_base64_image(req.init_images[0]).resize((req.width, req.height), PIL.Image.LANCZOS)\n",
                    "    loaded_adapters = _apply_loras(active_pipe, req.loras, req.civitai_api_key)\n",
                    "    is_pony = \"pony\" in str(req.base_model).lower() or \"pony\" in str(globals().get(\"CURRENT_BASE_MODEL_FILE\", \"\")).lower()\n",
                    "    if is_pony:\n",
                    "        prompt_str = req.prompt if \"score_\" in req.prompt else f\"score_9, score_8_up, score_7_up, source_anime, {req.prompt}\"\n",
                    "        neg_prompt_str = req.negative_prompt if req.negative_prompt and \"score_\" in req.negative_prompt else f\"score_4, score_5, score_6, score_4_up, score_5_up, score_6_up, rating_explicit, {req.negative_prompt or ''}\"\n",
                    "    else:\n",
                    "        prompt_str = req.prompt\n",
                    "        neg_prompt_str = req.negative_prompt\n",
                    "\n",
                    "    with torch.inference_mode():\n",
                    "        kwargs = dict(prompt=prompt_str, negative_prompt=neg_prompt_str, image=init_image, strength=req.denoising_strength, num_inference_steps=req.steps, guidance_scale=req.cfg_scale, generator=generator)\n",
                    "        if is_inpaint:\n",
                    "            mask_img = _decode_base64_image(req.mask).resize((req.width, req.height), PIL.Image.LANCZOS)\n",
                    "            kwargs['mask_image'] = mask_img\n",
                    "        image = active_pipe(**kwargs).images[0]\n",
                    "    if loaded_adapters:\n",
                    "        try: active_pipe.delete_adapters(loaded_adapters)\n",
                    "        except: pass\n",
                    "    return {\"images\": [_encode_image_to_base64(image)], \"source\": f\"Google Colab Cloud GPU ({torch.cuda.get_device_name(0)})\"}\n"
                ])
                continue
            
            if in_img2img:
                if line.startswith('@app.post("/sdapi/v1/img2img")'):
                    in_img2img = False
                    new_source.append(line)
                continue
            
            new_source.append(line)
        
        cell['source'] = new_source

with open('colab_server.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=2, ensure_ascii=False)

print("colab_server.ipynb patched successfully.")
