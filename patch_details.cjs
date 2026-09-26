const fs = require('fs');

let content = fs.readFileSync('src/components/common/ImageViewerModal.jsx', 'utf8');

// Insert state and handleCopyDetails function
const stateHookStr = `  const [showDetails, setShowDetails] = useState(false);`;
const stateHookReplacement = `  const [showDetails, setShowDetails] = useState(false);
  const [copiedDetails, setCopiedDetails] = useState(false);
  
  const handleCopyDetails = () => {
    if (!currentImage) return;
    const loraText = currentImage.lora ? \`\\nLoRA: \${currentImage.lora}\` : currentImage.loras ? \`\\nLoRAs: \${currentImage.loras.join(', ')}\` : '';
    const negPromptText = currentImage.negativePrompt ? \`\\nNegative Prompt: \${currentImage.negativePrompt}\` : '';
    const dateText = currentImage.timestamp ? new Date(currentImage.timestamp).toLocaleString() : 'Unknown';
    
    const details = \`Base Model: \${currentImage.model || currentImage.modelUsed || 'Unknown'}\${loraText}
Prompt: \${currentImage.prompt || 'None'}\${negPromptText}
Steps: \${currentImage.steps || 20}
CFG Scale: \${currentImage.cfg || 7.0}
Sampler: \${currentImage.sampler || 'DPM++ 2M Karras'}
Dimensions: \${currentImage.width && currentImage.height ? \\\`\${currentImage.width}x\${currentImage.height}\\\` : '512x768'}
Seed: \${currentImage.seed || 'Unknown'}
Date: \${dateText}\`.trim();

    navigator.clipboard.writeText(details);
    setCopiedDetails(true);
    setTimeout(() => setCopiedDetails(false), 2000);
  };`;
content = content.replace(stateHookStr, stateHookReplacement);

// Insert Copy Button
const headerStr = `            <h3 className="text-[var(--text-primary)] font-semibold mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#a855f7]" /> {t('viewer.generationDetails', 'Generation Details')}
            </h3>`;
const headerReplacement = `            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[var(--text-primary)] font-semibold flex items-center gap-2">
                <Info className="w-4 h-4 text-[#a855f7]" /> {t('viewer.generationDetails', 'Generation Details')}
              </h3>
              <button 
                onClick={handleCopyDetails}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[var(--surface-3)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-4)] transition-all border border-[var(--border-subtle)]"
                title={t('viewer.copyDetails', 'Copy Details')}
              >
                {copiedDetails ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedDetails ? t('viewer.copied', 'Copied!') : t('viewer.copy', 'Copy')}
              </button>
            </div>`;
content = content.replace(headerStr, headerReplacement);

// Insert Date in grid
const gridStr = `                <div className="bg-[var(--surface-3)] p-2 rounded-lg border border-[var(--border-subtle)]">
                  <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">{t('viewer.dimensions', 'Dimensions')}</div>
                  <div className="text-sm text-[var(--text-secondary)] font-mono">
                    {currentImage.width && currentImage.height ? \`\${currentImage.width}x\${currentImage.height}\` : '512x768'}
                  </div>
                </div>
              </div>`;
const gridReplacement = `                <div className="bg-[var(--surface-3)] p-2 rounded-lg border border-[var(--border-subtle)]">
                  <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">{t('viewer.dimensions', 'Dimensions')}</div>
                  <div className="text-sm text-[var(--text-secondary)] font-mono">
                    {currentImage.width && currentImage.height ? \`\${currentImage.width}x\${currentImage.height}\` : '512x768'}
                  </div>
                </div>
                <div className="bg-[var(--surface-3)] p-2 rounded-lg border border-[var(--border-subtle)] col-span-2">
                  <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">{t('viewer.date', 'Date')}</div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {currentImage.timestamp ? new Date(currentImage.timestamp).toLocaleString() : t('viewer.unknown', 'Unknown')}
                  </div>
                </div>
              </div>`;
content = content.replace(gridStr, gridReplacement);

fs.writeFileSync('src/components/common/ImageViewerModal.jsx', content);
console.log('ImageViewerModal patched with Copy Details and Date.');
