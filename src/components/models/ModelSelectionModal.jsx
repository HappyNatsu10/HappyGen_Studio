import React, { useEffect, useState } from 'react';
import { X, Cpu, AlertTriangle } from 'lucide-react';
import ModelExplorer from './ModelExplorer';
// removed import

import useAppStore from '../../store/useAppStore';
import useModelStore from '../../store/useModelStore';

export default function ModelSelectionModal() {
  const { showModelModal: isOpen, closeModelModal: onClose, isAdultMode, modalEngineContext: engineContext } = useAppStore();
  const { setBaseModel, addLora } = useModelStore();
  const [animationClass, setAnimationClass] = useState('opacity-0 scale-95');
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimationClass('opacity-100 scale-100'), 10);
    } else {
      setAnimationClass('opacity-0 scale-95');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const intent = engineContext?.intent || 'base';
  const arch = engineContext?.arch;
  
  let forcedBaseModel = 'All';
  if (intent === 'lora' && arch) {
    if (arch.includes('SDXL')) forcedBaseModel = 'SDXL 1.0';
    else if (arch.includes('SD 1.5')) forcedBaseModel = 'SD 1.5';
    else if (arch.includes('Pony')) forcedBaseModel = 'Pony';
    else if (arch.includes('Illustrious')) forcedBaseModel = 'Illustrious';
    else if (arch.includes('Flux')) forcedBaseModel = 'Flux.1 D';
    else forcedBaseModel = arch;
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-200 bg-black/60 backdrop-blur-sm ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`w-full max-w-6xl h-[85vh] rounded-2xl flex flex-col shadow-2xl transition-all duration-200 transform ${animationClass}`}
        style={{ 
          background: 'var(--surface-0)', 
          border: '1px solid var(--border-subtle)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <h2 className="text-[16px] font-semibold flex items-center gap-2 text-white">
              <Cpu className="w-4 h-4 text-purple-400" />
              {intent === 'lora' ? 'Browse & Add LoRA' : 'Select Base Model'}
            </h2>
            {forcedBaseModel !== 'All' && intent === 'lora' && (
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                Showing only <strong className="text-purple-300 font-medium">{forcedBaseModel}</strong> compatible LoRAs to match your Base Model.
              </p>
            )}
            {intent === 'base' && (
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                Search all available base models.
              </p>
            )}
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-xl transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (ModelExplorer) */}
        <div className="flex-1 overflow-hidden flex relative rounded-b-2xl">
          <ModelExplorer
            isAdultMode={isAdultMode}
            forcedBaseModel={forcedBaseModel}
            forcedType={intent === 'lora' ? 'LORA' : 'Checkpoint'}
            onSelectBaseModel={(model) => {
              setBaseModel({
                id: model.id,
                name: model.name,
                thumbnailUrl: model.thumbnailUrl,
                version: model.selectedVersion || model.version,
              });
              onClose();
            }}
            onAddLora={(lora) => {
              if (intent === 'lora' && arch) {
                const loraArch = lora.version?.baseModel || lora.baseModel;
                const normalize = (a) => {
                  if (!a) return '';
                  if (a.includes('SDXL')) return 'SDXL';
                  if (a.includes('SD 1.5')) return 'SD 1.5';
                  if (a.includes('Pony')) return 'Pony';
                  if (a.includes('Illustrious')) return 'Illustrious';
                  if (a.includes('Flux')) return 'Flux';
                  return a;
                };
                const normArch = normalize(arch);
                const normLoraArch = normalize(loraArch);
                
                if (normLoraArch && normArch && normLoraArch !== normArch) {
                  setValidationError({
                    title: 'Incompatible LoRA Architecture',
                    message: `Your current Base Model is ${arch}. This LoRA is designed for ${loraArch}. Please choose a LoRA that matches your Base Model.`
                  });
                  return;
                }
              }
              addLora(lora);
              onClose();
            }}
            isModal={true}
          />
        </div>

        {/* Validation Error Dialog Overlay */}
        {validationError && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl p-4">
            <div className="bg-[var(--surface-1)] border border-red-500/30 rounded-xl max-w-sm w-full p-5 shadow-2xl">
              <div className="flex items-center gap-3 text-red-400 mb-3">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-semibold text-white">{validationError.title}</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-5">
                {validationError.message}
              </p>
              <div className="flex justify-end">
                <button 
                  onClick={() => setValidationError(null)}
                  className="btn btn-primary bg-red-500 hover:bg-red-600 border-none"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
