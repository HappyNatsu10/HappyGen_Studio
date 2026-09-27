import React, { useState, useEffect, useRef } from 'react';

export default function Tooltip({ text, children, position = 'left' }) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef(null);
  
  let positionClasses = "left-0";
  let arrowClasses = "left-4";
  
  if (position === 'center') {
    positionClasses = "left-1/2 -translate-x-1/2";
    arrowClasses = "left-1/2 -translate-x-1/2";
  } else if (position === 'right') {
    positionClasses = "right-0";
    arrowClasses = "right-4";
  }

  // Close on outside click for mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
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

  return (
    <div 
      ref={tooltipRef}
      className="relative flex items-center group cursor-pointer" 
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
      }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children}
      <div className={`absolute bottom-full ${positionClasses} mb-2 w-max max-w-[220px] bg-slate-800 text-white text-[11px] font-medium leading-tight px-3 py-2 rounded-lg shadow-xl transition-opacity duration-200 z-[100] border border-slate-700 whitespace-normal text-left ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {text}
        <div className={`absolute top-full ${arrowClasses} border-4 border-transparent border-t-slate-800`}></div>
      </div>
    </div>
  );
}
