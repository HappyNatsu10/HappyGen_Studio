import React, { useState } from 'react';
import { Upload, Sparkles, Copy, Check, Eye, Wand2, Image as ImageIcon, X } from 'lucide-react';

export default function ImageToPromptModal({ isOpen, onClose, onUsePrompt }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isInterrogating, setIsInterrogating] = useState(false);
  const [extractedResult, setExtractedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      runInterrogator(url);
    }
  };

  const runInterrogator = (imgUrl) => {
    setIsInterrogating(true);
    setExtractedResult(null);

    // AI Vision CLIP Interrogator simulation
    setTimeout(() => {
      setExtractedResult({
        fullPrompt: "A high-concept futuristic cyberpunk warrior wearing glowing obsidian armor, volumetric neon rim lighting, 8k resolution, shot on 35mm lens, octane render,Makoto Shinkai style vibrancy, intricate mechanical details, cinematic atmosphere",
        subject: "Futuristic Cyberpunk Warrior",
        style: "Cyberpunk / 3D Octane Render",
        lighting: "Volumetric Neon Rim Lighting",
        colorPalette: ["#4f46e5", "#ec4899", "#06b6d4", "#111827"],
        confidenceScore: 0.978
      });
      setIsInterrogating(false);
    }, 1800);
  };

  const handleCopy = () => {
    if (extractedResult) {
      navigator.clipboard.writeText(extractedResult.fullPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-900 border border-indigo-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-6 p-6 relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xl">
            🔍
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white font-display">Image-to-Prompt Interrogator</h2>
            <p className="text-xs text-slate-400">Reverse-engineer any image into a detailed AI generation prompt.</p>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="border-2 border-dashed border-indigo-500/40 rounded-2xl p-6 text-center space-y-3 bg-indigo-950/20 hover:bg-indigo-950/30 transition-all">
          {selectedImage ? (
            <div className="relative max-w-xs mx-auto rounded-xl overflow-hidden border border-white/20">
              <img src={selectedImage} alt="Interrogate target" className="w-full h-44 object-cover" />
              <button
                onClick={() => { setSelectedImage(null); setExtractedResult(null); }}
                className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded-md"
              >
                Change Image
              </button>
            </div>
          ) : (
            <label className="cursor-pointer space-y-2 block">
              <Upload className="w-8 h-8 text-indigo-400 mx-auto" />
              <div className="text-sm font-bold text-slate-200">Upload or Drag & Drop Image Here</div>
              <p className="text-xs text-slate-500">Supports PNG, JPG, WebP up to 25MB</p>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>

        {/* Interrogation Status / Result */}
        {isInterrogating && (
          <div className="p-4 rounded-xl bg-slate-950 text-center space-y-2">
            <Sparkles className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
            <div className="text-xs text-indigo-300 font-bold">Analyzing Neural Feature Maps & Style Vectors...</div>
          </div>
        )}

        {extractedResult && !isInterrogating && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-indigo-400">Extracted Detailed Prompt</span>
                <button
                  onClick={handleCopy}
                  className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
                </button>
              </div>
              <p className="p-3 bg-slate-900 rounded-xl text-xs text-slate-200 leading-relaxed italic">
                "{extractedResult.fullPrompt}"
              </p>
            </div>

            {/* Feature Breakdown Pills */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-900 rounded-lg">
                <span className="text-slate-500 block text-[10px]">Identified Subject</span>
                <span className="font-bold text-slate-200">{extractedResult.subject}</span>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg">
                <span className="text-slate-500 block text-[10px]">Art Style</span>
                <span className="font-bold text-slate-200">{extractedResult.style}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onUsePrompt(extractedResult.fullPrompt);
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
            >
              <Wand2 className="w-4 h-4" />
              <span>Use Extracted Prompt in Studio</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
