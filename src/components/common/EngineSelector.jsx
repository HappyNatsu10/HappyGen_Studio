import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Cpu, HelpCircle } from 'lucide-react';
import Tooltip from './Tooltip';

export default function EngineSelector({ engines, selectedEngineId, onSelectEngine, label = "AI Engine" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Find currently selected engine info
  let selectedEngine = null;
  engines.forEach(group => {
    const found = group.models.find(m => m.id === selectedEngineId);
    if (found) selectedEngine = found;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="text-[12px] font-medium flex items-center gap-1.5 mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
        {label}
        <Tooltip text="The backend provider or hardware powering the generation.">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help" />
        </Tooltip>
      </label>
      
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left"
        style={{ 
          background: isOpen ? 'var(--surface-2)' : 'var(--surface-1)', 
          borderColor: isOpen ? 'var(--accent)' : 'var(--border-default)' 
        }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Cpu className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
          <span className="text-[13px] font-semibold truncate text-white">
            {selectedEngine ? selectedEngine.name : 'Select Engine'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-tertiary)' }} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-1 rounded-xl border shadow-xl overflow-y-auto"
          style={{ 
            background: '#1e1e24', // A dark color matching the screenshot
            borderColor: 'var(--border-subtle)',
            maxHeight: '350px' 
          }}
        >
          <div className="py-2">
            {engines.map((group, gIdx) => (
              <div key={gIdx} className="mb-2 last:mb-0">
                {group.provider !== 'DEFAULT' && (
                  <div className="px-4 py-1.5 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    {group.provider}
                  </div>
                )}
                <div className="flex flex-col">
                  {group.models.map(model => {
                    const isSelected = selectedEngineId === model.id;
                    return (
                      <button
                        key={model.id}
                        onClick={() => {
                          onSelectEngine(model.id);
                          setIsOpen(false);
                        }}
                        className={`text-left px-4 py-2 text-[13px] transition-colors flex items-center gap-2 ${
                          isSelected ? 'bg-purple-600/20 text-purple-300 font-semibold' : 'text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        <span>{model.name}</span>
                        {model.badge && (
                          <span className="px-1.5 rounded-sm bg-purple-900/50 text-purple-300 text-[10px]">
                            {model.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
