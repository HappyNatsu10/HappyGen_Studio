import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Image as ImageIcon, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { interrogateImage } from '../../services/aiService';

export default function ImageToPromptModal({ isOpen, onClose, onUsePrompt }) {
  const [sourceImage, setSourceImage] = useState(null);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [interrogator, setInterrogator] = useState('deepdanbooru');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Re-run if they toggle the model while an image is loaded
  React.useEffect(() => {
    if (!sourceImage || !isOpen) return;
    const runInterrogate = async () => {
      setIsProcessing(true);
      setError('');
      try {
        const result = await interrogateImage({ sourceImage, model: interrogator });
        if (result) {
          const promptText = typeof result === 'string' ? result : result.caption;
          if (promptText) {
            setGeneratedPrompt(promptText);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsProcessing(false);
      }
    };
    runInterrogate();
  }, [interrogator, sourceImage, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const b64 = e.target.result;
      // Setting sourceImage will trigger the useEffect to run interrogateImage
      setSourceImage(b64);
      setGeneratedPrompt('');
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setSourceImage(null);
    setGeneratedPrompt('');
    setError('');
  };

  const handleCopy = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-4xl bg-[#1A1B23] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: '90vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-white">Image To Prompt</h2>
                <div className="flex bg-white/5 p-1 rounded-lg">
                  <button
                    onClick={() => setInterrogator('deepdanbooru')}
                    className={`px-3 py-1 text-[12px] font-medium rounded-md transition-colors ${interrogator === 'deepdanbooru' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Anime Tags
                  </button>
                  <button
                    onClick={() => setInterrogator('clip')}
                    className={`px-3 py-1 text-[12px] font-medium rounded-md transition-colors ${interrogator === 'clip' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Realistic Text
                  </button>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col md:flex-row p-6 gap-6 min-h-[400px]">
              {/* Left side: Image Upload/Display */}
              <div className="flex-1 flex flex-col">
                {!sourceImage ? (
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-purple-500/50 rounded-xl bg-white/5 cursor-pointer transition-all group min-h-[300px]">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <ImageIcon className="w-12 h-12 text-slate-500 mb-4 group-hover:text-purple-400 transition-colors" />
                    <p className="text-sm font-medium text-slate-300">Click or drag image to upload</p>
                    <p className="text-xs text-slate-500 mt-2">Supports JPG, PNG, WebP</p>
                  </label>
                ) : (
                  <div className="relative flex-1 rounded-xl overflow-hidden bg-black/50 border border-white/5 flex items-center justify-center min-h-[300px]">
                    <img src={sourceImage} alt="Source" className="max-w-full max-h-full object-contain" />
                    <button 
                      onClick={handleReset}
                      className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded-full backdrop-blur-md transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-3" />
                        <span className="text-sm font-medium text-white shadow-sm">Analyzing Image...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right side: Result */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-white">Prompt</h3>
                  <button 
                    onClick={handleCopy}
                    disabled={!generatedPrompt}
                    className="p-1.5 text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1 relative">
                  {error ? (
                    <div className="w-full h-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-center text-center">
                      {error}
                    </div>
                  ) : (
                    <textarea
                      value={generatedPrompt}
                      readOnly
                      placeholder="Generated tags will appear here..."
                      className="w-full h-full bg-[#23242E] border border-white/5 rounded-xl p-4 text-[13px] leading-relaxed text-slate-300 placeholder-slate-600 focus:outline-none resize-none shadow-inner min-h-[250px]"
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all text-sm font-medium flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset
                  </button>
                  <button
                    onClick={() => {
                      onUsePrompt(generatedPrompt);
                      onClose();
                    }}
                    disabled={!generatedPrompt || isProcessing}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F772D9] to-[#9955FF] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-lg shadow-purple-500/25"
                  >
                    Use Prompt
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Use portal to escape any CSS transforms in parent elements
  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
