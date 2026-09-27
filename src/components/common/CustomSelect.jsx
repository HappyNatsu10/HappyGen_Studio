import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({ value, onChange, options, groups, className, size = 'md' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});
  
  const paddingClass = size === 'sm' ? 'px-2 py-1.5 text-xs' : 'px-4 py-2.5 text-[13px]';

  const updatePosition = () => {
    if (containerRef.current && isOpen) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        position: 'fixed',
        zIndex: 9999
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideContainer = containerRef.current && !containerRef.current.contains(event.target);
      const clickedOutsideDropdown = dropdownRef.current ? !dropdownRef.current.contains(event.target) : true;
      
      if (clickedOutsideContainer && clickedOutsideDropdown) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Compute display label
  let displayLabel = value;
  if (options) {
    const selectedOpt = options.find(o => o.value === value);
    if (selectedOpt) displayLabel = selectedOpt.label;
  } else if (groups) {
    for (const g of groups) {
      const selectedOpt = g.options.find(o => o.value === value);
      if (selectedOpt) {
        displayLabel = selectedOpt.label;
        break;
      }
    }
  }

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className || ''}`} ref={containerRef}>
      <div 
        className={`flex items-center justify-between w-full bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl ${paddingClass} text-[var(--text-primary)] cursor-pointer hover:border-[var(--accent)] transition-colors`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate pr-4">{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          style={dropdownStyle}
          className="max-h-64 overflow-y-auto bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl shadow-2xl animate-scale-in"
        >
          {options && options.map((opt) => (
            <div 
              key={opt.value}
              className={`flex items-center justify-between px-4 py-2.5 text-[13px] cursor-pointer hover:bg-[var(--surface-2)] transition-colors ${value === opt.value ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-primary)]'}`}
              onClick={() => handleSelect(opt.value)}
            >
              <span className="truncate">{opt.label}</span>
              {value === opt.value && <Check className="w-4 h-4" />}
            </div>
          ))}

          {groups && groups.map((group, idx) => (
            <div key={group.label || idx}>
              {group.label && (
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-[var(--text-tertiary)] bg-[var(--surface-0)] sticky top-0 z-10">
                  {group.label}
                </div>
              )}
              {group.options.map(opt => (
                <div 
                  key={opt.value}
                  className={`flex items-center justify-between px-4 py-2.5 text-[13px] cursor-pointer hover:bg-[var(--surface-2)] transition-colors ${value === opt.value ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-primary)]'}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  <span className="truncate">{opt.label}</span>
                  {value === opt.value && <Check className="w-4 h-4" />}
                </div>
              ))}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
