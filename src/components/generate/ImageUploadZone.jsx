import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export default function ImageUploadZone({ label, value, onChange }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => onChange(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="mb-4">
      {label && <label className="text-[11px] font-medium block mb-2 text-[var(--text-tertiary)]">{label}</label>}
      
      {!value ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragging ? 'border-[var(--accent)] bg-[var(--accent-muted)]' : 'border-[var(--border-default)] hover:border-[var(--border-hover)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)]'
          }`}
        >
          <Upload className={`w-6 h-6 mb-2 ${isDragging ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}`} />
          <span className="text-[12px] font-medium text-[var(--text-secondary)]">Click or drag image here</span>
          <span className="text-[10px] text-[var(--text-tertiary)] mt-1">PNG, JPG, WEBP up to 10MB</span>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-1)]">
          <img src={value} alt="Source" className="w-full h-auto max-h-[200px] object-contain bg-black/20" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-500/80 transition-colors backdrop-blur-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
        }}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
