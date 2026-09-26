import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Eraser, Brush, RotateCcw, Hand } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useTranslation } from 'react-i18next';

export default function InpaintCanvas({ sourceImage, onChangeSource, onMaskChange }) {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const isDrawing = useRef(false);
  const [brushSize, setBrushSize] = useState(25);
  const [tool, setTool] = useState('brush'); // 'brush', 'eraser', 'pan'
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [fitSize, setFitSize] = useState({ width: 0, height: 0 });
  const cursorCanvasRef = useRef(null);
  const lastPos = useRef(null);

  useEffect(() => {
    if (sourceImage) {
      const img = new Image();
      img.onload = () => {
        const natWidth = img.width || img.naturalWidth;
        const natHeight = img.height || img.naturalHeight;
        setImageSize({ width: natWidth, height: natHeight });
        initCanvas(natWidth, natHeight);
      };
      img.src = sourceImage;
    }
  }, [sourceImage]);

  useEffect(() => {
    if (!wrapperRef.current || !imageSize.width || !imageSize.height) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      
      const { width: wrapperW, height: wrapperH } = entry.contentRect;
      const scaleX = wrapperW / imageSize.width;
      const scaleY = wrapperH / imageSize.height;
      const scale = Math.min(scaleX, scaleY, 1) * 0.95; // 5% padding
      
      setFitSize({
        width: imageSize.width * scale,
        height: imageSize.height * scale
      });
    });

    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [imageSize]);

  const initCanvas = (width, height) => {
    // Width and height are now handled by React props directly.
    // We just need to trigger the initial mask update if canvases exist
    const canvas = canvasRef.current;
    const cursorCanvas = cursorCanvasRef.current;
    if (!canvas || !cursorCanvas) return;
    
    updateMaskData();
  };

  // When canvases finally mount (after fitSize is set), initialize the mask
  useEffect(() => {
    if (fitSize.width > 0 && canvasRef.current && imageSize.width > 0) {
      // Clear the main canvas and init mask
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, imageSize.width, imageSize.height);
      updateMaskData();
    }
  }, [fitSize.width]);

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
      y: (clientY - rect.top) * scaleY,
      scale: scaleX
    };
  };

  const startDrawing = (e) => {
    if (e.cancelable) e.preventDefault();
    isDrawing.current = true;
    const { x, y, scale } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    // Draw a single dot if they just click
    draw(e);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    if (e.cancelable) e.preventDefault();
    
    const { x, y, scale } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Use screen pixels mapped to internal image pixels
    ctx.lineWidth = brushSize * scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'brush') {
      // Use theme accent color for visual feedback
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#6366f1';
      ctx.strokeStyle = accent;
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)'; // color doesn't matter for destination-out
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const drawCursor = (x, y, scale) => {
    const cursorCanvas = cursorCanvasRef.current;
    if (!cursorCanvas) return;
    const ctx = cursorCanvas.getContext('2d');
    
    ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    
    if (tool === 'pan') return;

    ctx.beginPath();
    ctx.arc(x, y, (brushSize * scale) / 2, 0, Math.PI * 2);
    ctx.lineWidth = 1.5 * scale; // Keep border thin visually
    ctx.strokeStyle = 'white';
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(x, y, ((brushSize * scale) / 2) - (1 * scale), 0, Math.PI * 2);
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeStyle = 'black';
    ctx.setLineDash([4 * scale, 4 * scale]);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const handlePointerMove = (e) => {
    if (tool === 'pan') return;
    
    const { x, y, scale } = getCoordinates(e);
    lastPos.current = { x, y, scale };
    
    // Handle drawing
    if (isDrawing.current) {
      draw(e);
    }
    
    // Handle cursor
    drawCursor(x, y, scale);
  };

  const handlePointerLeave = () => {
    if (tool !== 'pan') {
      stopDrawing();
      const cursorCanvas = cursorCanvasRef.current;
      if (cursorCanvas) {
        cursorCanvas.getContext('2d').clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
      }
    }
  };

  // Re-draw cursor if brush size changes
  useEffect(() => {
    if (lastPos.current) {
      drawCursor(lastPos.current.x, lastPos.current.y, lastPos.current.scale);
    }
  }, [brushSize]);

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
    
    // Create another temp canvas to isolate the drawn mask and convert to pure white
    const maskOnlyCanvas = document.createElement('canvas');
    maskOnlyCanvas.width = canvasRef.current.width;
    maskOnlyCanvas.height = canvasRef.current.height;
    const mCtx = maskOnlyCanvas.getContext('2d');
    
    // Draw the user's mask (which is in accent color)
    mCtx.drawImage(canvasRef.current, 0, 0);
    // Change all non-transparent pixels to white
    mCtx.globalCompositeOperation = 'source-in';
    mCtx.fillStyle = 'white';
    mCtx.fillRect(0, 0, maskOnlyCanvas.width, maskOnlyCanvas.height);
    
    // Draw the pure white mask on top of the black background
    tCtx.drawImage(maskOnlyCanvas, 0, 0);
    
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
    <div className="flex flex-col w-full h-full min-h-0 pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 shrink-0">
        <label className="text-[11px] font-medium text-[var(--text-tertiary)]">{t('inpaint.inpaintMask', 'Inpaint Image & Mask')}</label>
        {sourceImage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTool('pan')}
              className={`p-1.5 rounded transition-colors ${tool === 'pan' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'}`}
              title={t('inpaint.pan', 'Pan / Zoom')}
            >
              <Hand className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-4 bg-[var(--border-subtle)] mx-0.5"></div>
            <button
              onClick={() => setTool('brush')}
              className={`p-1.5 rounded transition-colors ${tool === 'brush' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'}`}
              title={t('inpaint.brush', 'Brush')}
            >
              <Brush className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-1.5 rounded transition-colors ${tool === 'eraser' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'}`}
              title={t('inpaint.eraser', 'Eraser')}
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={clearMask}
              className="p-1.5 rounded bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-white transition-colors ml-1"
              title={t('inpaint.clearMask', 'Clear Mask')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {!sourceImage ? (
        <div className="flex-1 min-h-0 border-2 border-dashed border-[var(--border-default)] rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--border-hover)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] transition-colors"
             onClick={() => document.getElementById('inpaint-upload').click()}>
          <Upload className="w-6 h-6 mb-2 text-[var(--text-tertiary)]" />
          <span className="text-[12px] font-medium text-[var(--text-secondary)]">{t('inpaint.uploadImage', 'Upload image to inpaint')}</span>
          <input 
            id="inpaint-upload"
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} 
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col w-full relative min-h-[300px]">
          
          {/* Absolute wrapper to provide definite height to image without circular dependency */}
          <div className="flex-1 relative w-full mb-3">
            <div className="absolute inset-0 flex justify-center items-center overflow-hidden" ref={wrapperRef}>
              {fitSize.width > 0 && (
                <TransformWrapper
                  initialScale={1}
                  minScale={0.5}
                  maxScale={8}
                  disabled={tool !== 'pan'}
                  panning={{ disabled: tool !== 'pan' }}
                  pinch={{ disabled: tool !== 'pan', step: 1 }}
                  doubleClick={{ disabled: tool !== 'pan' }}
                  wheel={{ step: 0.05, smoothStep: 0.005, disabled: tool !== 'pan' }}
                  limitToBounds={false}
                  animation={{ disabled: false, animationTime: 200 }}
                >
                  <TransformComponent wrapperClass="w-full h-full flex justify-center items-center">
                    <div 
                      ref={containerRef}
                      className="relative inline-flex rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] shadow-lg"
                      style={{ 
                         width: fitSize.width, 
                         height: fitSize.height 
                      }}
                    >
                    {/* The base image */}
                    <img 
                      src={sourceImage} 
                      alt="Source for Inpainting" 
                      className="block w-full h-full select-none pointer-events-none" 
                    />
                    
                    {/* The drawing canvas overlay */}
                    <canvas
                      ref={canvasRef}
                      width={imageSize.width}
                      height={imageSize.height}
                      className={`absolute top-0 left-0 w-full h-full pointer-events-none`}
                      style={{ opacity: 0.8 }}
                    />
                    
                    <canvas
                      ref={cursorCanvasRef}
                      width={imageSize.width}
                      height={imageSize.height}
                      onMouseDown={(e) => tool !== 'pan' && startDrawing(e)}
                      onMouseMove={handlePointerMove}
                      onMouseUp={(e) => tool !== 'pan' && stopDrawing()}
                      onMouseLeave={handlePointerLeave}
                      onTouchStart={(e) => tool !== 'pan' && startDrawing(e)}
                      onTouchMove={handlePointerMove}
                      onTouchEnd={(e) => tool !== 'pan' && stopDrawing()}
                      onTouchCancel={handlePointerLeave}
                      className={`absolute top-0 left-0 w-full h-full touch-none ${tool === 'pan' ? 'cursor-grab active:cursor-grabbing' : ''}`}
                      style={{ 
                        opacity: 1,
                        cursor: tool !== 'pan' ? 'none' : undefined
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
                </TransformComponent>
              </TransformWrapper>
              )}
            </div>
          </div>

          {/* Brush Slider */}
          <div className="shrink-0 flex items-center justify-center gap-3 px-4">
            <span className="text-[11px] font-medium text-[var(--text-tertiary)]">{t('inpaint.size', 'Brush Size:')} {brushSize}px</span>
            <input
              type="range"
              min="5"
              max="100"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-48"
            />
          </div>
        </div>
      )}
    </div>
  );
}
