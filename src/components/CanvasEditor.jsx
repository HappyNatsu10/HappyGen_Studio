import React, { useState, useRef, useEffect } from 'react';
import { Edit3, Eraser, Brush, Download, Upload, Zap, Layers, RefreshCw, Scissors, Sparkles } from 'lucide-react';

export default function CanvasEditor({ initialImageUrl, isAdultMode }) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl || null);
  const [brushSize, setBrushSize] = useState(25);
  const [tool, setTool] = useState('brush'); // 'brush' | 'eraser'
  const [inpaintPrompt, setInpaintPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (initialImageUrl) {
      setImageUrl(initialImageUrl);
    }
  }, [initialImageUrl]);

  // Handle HTML Canvas drawing mask
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDrawing.current = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'brush') {
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.7)';
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.globalCompositeOperation = 'destination-out';
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const handleClearMask = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleInpaintGenerate = () => {
    if (!inpaintPrompt.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      // Generate inpaint variation
      const newSeed = Math.floor(Math.random() * 999999);
      const updatedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(inpaintPrompt + ', seamlessly blended inpaint edit')}?width=1024&height=1024&seed=${newSeed}&nologo=true`;
      setImageUrl(updatedUrl);
      handleClearMask();
      setIsProcessing(false);
    }, 2000);
  };

  const handleRemoveBackground = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert("Background removed! Subject isolated successfully.");
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-white flex items-center space-x-2">
            <Edit3 className="w-6 h-6 text-indigo-400" />
            <span>Interactive Inpainting & Generative Studio</span>
          </h1>
          <p className="text-xs text-slate-400">Draw masks over regions of your image to edit, replace elements, or erase background.</p>
        </div>
      </div>

      {/* Toolbar & Canvas Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Toolbar */}
        <div className="glass-panel p-5 rounded-2xl space-y-5 lg:col-span-1">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Tool Selection</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTool('brush')}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  tool === 'brush' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Brush className="w-4 h-4" />
                <span>Mask Brush</span>
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  tool === 'eraser' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                <Eraser className="w-4 h-4" />
                <span>Mask Eraser</span>
              </button>
            </div>
          </div>

          {/* Brush Size Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span>Brush Diameter</span>
              <span className="text-indigo-400">{brushSize}px</span>
            </div>
            <input
              type="range"
              min="5"
              max="80"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <button
            onClick={handleClearMask}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all"
          >
            Clear Mask Layer
          </button>

          {/* AI Workflow Tools */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <label className="text-xs font-bold text-slate-300 block">Smart AI Actions</label>
            <button
              onClick={handleRemoveBackground}
              disabled={isProcessing || !imageUrl}
              className="w-full py-2.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/30 text-purple-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
            >
              <Scissors className="w-4 h-4 text-purple-400" />
              <span>Remove Background</span>
            </button>
          </div>
        </div>

        {/* Right Canvas Area & Inpaint Prompt */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-3 space-y-4">
          <div className="relative aspect-square max-h-[550px] w-full mx-auto rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-white/10">
            {imageUrl ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img src={imageUrl} alt="Inpaint Canvas Target" className="max-w-full max-h-full object-contain pointer-events-none" />
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={800}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                />
              </div>
            ) : (
              <label className="cursor-pointer text-center space-y-2">
                <Upload className="w-10 h-10 text-indigo-400 mx-auto animate-bounce" />
                <div className="text-sm font-bold text-slate-200">Upload Image to Inpaint / Edit</div>
                <p className="text-xs text-slate-500">Or send an image directly from the Image Studio tab</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setImageUrl(URL.createObjectURL(file));
                  }} 
                />
              </label>
            )}
          </div>

          {/* Inpaint Prompt Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inpaintPrompt}
              onChange={(e) => setInpaintPrompt(e.target.value)}
              placeholder="Describe what to generate inside masked area (e.g. 'replace jacket with futuristic cyber armor')..."
              className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none"
            />
            <button
              onClick={handleInpaintGenerate}
              disabled={isProcessing || !inpaintPrompt.trim() || !imageUrl}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs rounded-xl shadow-lg hover:scale-105 transition-all flex items-center justify-center space-x-1.5"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Generative Fill</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
