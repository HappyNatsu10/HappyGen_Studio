const fs = require('fs');

function patchAdetailer(filename) {
    if (!fs.existsSync(filename)) return;
    const nb = JSON.parse(fs.readFileSync(filename, 'utf8'));

    let patched = false;
    for (let cell of nb.cells) {
        if (cell.cell_type === 'code') {
            const source = cell.source.join('');
            if (source.includes('def _do_adetailer')) {
                const lines = cell.source;
                for (let i=0; i<lines.length; i++) {
                    if (lines[i].includes('result_img = pipe_inpaint(')) {
                        let endIndex = i;
                        while(!lines[endIndex].includes(').images[0]')) endIndex++;
                        
                        let replacement = 
'        is_anima = globals().get("CURRENT_ARCHITECTURE") == "Anima" or (req.base_model and "anima" in str(req.base_model).lower())\n' +
'        if is_anima:\n' +
'            result_img = _anima_img2img(pipe, prompt_str, neg_prompt_str, image, 0.4, 30, 7.0, generator, mask)\n' +
'        else:\n' +
'            result_img = pipe_inpaint(\n' +
'                prompt=prompt_str, \n' +
'                negative_prompt=neg_prompt_str, \n' +
'                image=image, \n' +
'                mask_image=mask,\n' +
'                strength=0.4, \n' +
'                num_inference_steps=30, \n' +
'                guidance_scale=7.0, \n' +
'                generator=generator\n' +
'            ).images[0]\n';
                        
                        lines.splice(i, endIndex - i + 1, ...replacement.split('\n').filter(l => l.length > 0).map((l, idx, arr) => l + '\n'));
                        patched = true;
                        break;
                    }
                }
            }
        }
    }
    if (patched) {
        fs.writeFileSync(filename, JSON.stringify(nb, null, 2));
        console.log('Patched Adetailer in ' + filename);
    }
}

patchAdetailer('colab_server.ipynb');
