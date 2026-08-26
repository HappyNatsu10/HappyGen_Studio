import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Eraser, Brush, RotateCcw } from 'lucide-react';

export default function InpaintCanvas({ sourceImage, onChangeSource, onMaskChange }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawing = useRef(false);
  const [brushSize, setBrushSize] = useState(25);
  const [tool, setTool] = useState('brush'); // 'brush' or 'eraser'
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (sourceImage) {
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
        initCanvas(img.width, img.height);
      };
      img.src = sourceImage;
    }
  }, [sourceImage]);

  const initCanvas = (width, height) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    updateMaskData();
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    if (e.cancelable) e.preventDefault();
    isDrawing.current = true;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    // Draw a single dot if they just click
    draw(e);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    if (e.cancelable) e.preventDefault();
    
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'brush') {
      // Semi-transparent white or solid white based on requirement
      // Usually masks are black/white. We'll draw solid white on a transparent canvas,
      // and when exporting, we can fill a black background if needed, or just send the alpha channel.
      ctx.strokeStyle = 'rgba(255, 255, 255, 1)'; 
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)'; // color doesn't matter for destination-out
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      updateMaskData();
    }
  };

  const clearMask = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateMaskData();
  };

  const updateMaskData = () => {
    if (!canvasRef.current) return;
    
    // Create a temporary canvas to generate a proper black/white mask
    // Background = Black, Drawn areas = White
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasRef.current.width;
    tempCanvas.height = canvasRef.current.height;
    const tCtx = tempCanvas.getContext('2d');
    
    // Fill black
    tCtx.fillStyle = 'black';
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw the mask on top
    tCtx.drawImage(canvasRef.current, 0, 0);
    
    const maskDataUrl = tempCanvas.toDataURL('image/png');
    onMaskChange(maskDataUrl);
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => onChangeSource(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3 mb-4">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-[var(--text-tertiary)]">Inpaint Image & Mask</label>
        {sourceImage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTool('brush')}
              className={`p-1.5 rounded transition-colors ${tool === 'brush' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'}`}
              title="Brush"
            >
              <Brush className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-1.5 rounded transition-colors ${tool === 'eraser' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'}`}
              title="Eraser"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={clearMask}
              className="p-1.5 rounded bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-white transition-colors ml-1"
              title="Clear Mask"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {!sourceImage ? (
        <div className="border-2 border-dashed border-[var(--border-default)] rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--border-hover)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] transition-colors"
             onClick={() => document.getElementById('inpaint-upload').click()}>
          <Upload className="w-6 h-6 mb-2 text-[var(--text-tertiary)]" />
          <span className="text-[12px] font-medium text-[var(--text-secondary)]">Upload image to inpaint</span>
          <input 
            id="inpaint-upload"
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} 
          />
        </div>
      ) : (
        <div className="flex justify-center w-full relative">
          <div 
            ref={containerRef}
            className="relative inline-block rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-1)]"
          >
            {/* The base image */}
            <img 
              src={sourceImage} 
              alt="Source for Inpainting" 
              className="block w-auto h-auto max-w-full max-h-[400px] select-none pointer-events-none" 
            />
            
            {/* The drawing canvas overlay */}
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              onTouchCancel={stopDrawing}
              className="absolute top-0 left-0 w-full h-full cursor-crosshair touch-none"
              style={{
                opacity: 0.6,
                mixBlendMode: 'screen'
              }}
            />

            {/* Remove Image Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChangeSource(null);
                onMaskChange(null);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-500/80 transition-colors backdrop-blur-sm z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--text-tertiary)] w-14">Size: {brushSize}px</span>
            <input
              type="range"
              min="5"
              max="100"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="flex-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}
