const fs = require('fs');

function patch(filename, patchFile) {
    if (!fs.existsSync(filename)) return;
    const nb = JSON.parse(fs.readFileSync(filename, 'utf8'));
    const patchContent = fs.readFileSync(patchFile, 'utf8');
    
    const customLoopStart = patchContent.indexOf('custom_loop = """') + 17;
    const customLoopEnd = patchContent.indexOf('"""', customLoopStart);
    const customLoop = patchContent.slice(customLoopStart, customLoopEnd).trim() + '\n';

    let patched = false;
    for (let cell of nb.cells) {
        if (cell.cell_type === 'code') {
            const source = cell.source.join('');
            if (source.includes('def _anima_img2img')) {
                const startIndex = source.indexOf('def _anima_img2img');
                let endIndex = source.indexOf('def _do_img2img');
                if (endIndex === -1) {
                   endIndex = source.length;
                }
                const newSource = source.slice(0, startIndex) + customLoop + '\n' + source.slice(endIndex);
                cell.source = newSource.split('\n').map((line, i, arr) => line + (i === arr.length - 1 ? '' : '\n'));
                patched = true;
            }
        }
    }
    if (patched) {
        fs.writeFileSync(filename, JSON.stringify(nb, null, 2));
        console.log('Patched ' + filename + ' with ' + patchFile);
    }
}

patch('colab_server.ipynb', 'patch_anima_mask.py');
patch('colab_anima.ipynb', 'patch_anima_mask.py');
