import React from 'react';

export default function Tooltip({ text, children, position = 'left' }) {
  let positionClasses = "left-0";
  let arrowClasses = "left-4";
  
  if (position === 'center') {
    positionClasses = "left-1/2 -translate-x-1/2";
    arrowClasses = "left-1/2 -translate-x-1/2";
  } else if (position === 'right') {
    positionClasses = "right-0";
    arrowClasses = "right-4";
  }

  return (
    <div className="relative flex items-center group">
      {children}
      <div className={`absolute bottom-full ${positionClasses} mb-2 w-max max-w-[220px] bg-slate-800 text-white text-[11px] font-medium leading-tight px-3 py-2 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-[100] border border-slate-700 whitespace-normal text-left`}>
        {text}
        <div className={`absolute top-full ${arrowClasses} border-4 border-transparent border-t-slate-800`}></div>
      </div>
    </div>
  );
}
