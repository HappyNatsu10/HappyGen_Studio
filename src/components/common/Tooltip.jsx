import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Tooltip({ text, children, position = 'left', side = 'top' }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, arrowLeft: 16, actualSide: side });

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    if (triggerRect.width === 0 && triggerRect.height === 0) return;

    const tooltipEl = tooltipRef.current;
    const tooltipWidth = tooltipEl ? tooltipEl.offsetWidth : 220;
    const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 50;
    const gap = 8;
    const margin = 10;

    // Check vertical space
    let chosenSide = side;
    const spaceAbove = triggerRect.top;
    const spaceBelow = window.innerHeight - triggerRect.bottom;

    if (side === 'top' && spaceAbove < tooltipHeight + gap + margin && spaceBelow > spaceAbove) {
      chosenSide = 'bottom';
    } else if (side === 'bottom' && spaceBelow < tooltipHeight + gap + margin && spaceAbove > spaceBelow) {
      chosenSide = 'top';
    }

    let top = 0;
    if (chosenSide === 'top') {
      top = triggerRect.top - tooltipHeight - gap;
      if (top < margin) {
        top = triggerRect.bottom + gap;
        chosenSide = 'bottom';
      }
    } else {
      top = triggerRect.bottom + gap;
      if (top + tooltipHeight > window.innerHeight - margin) {
        top = triggerRect.top - tooltipHeight - gap;
        chosenSide = 'top';
      }
    }

    // Horizontal positioning
    let left = 0;
    if (position === 'center') {
      left = triggerRect.left + (triggerRect.width / 2) - (tooltipWidth / 2);
    } else if (position === 'right') {
      left = triggerRect.right - tooltipWidth;
    } else {
      // align left edge with trigger
      left = triggerRect.left - 4;
    }

    // Clamp horizontally to viewport
    const maxLeft = window.innerWidth - tooltipWidth - margin;
    const clampedLeft = Math.max(margin, Math.min(left, maxLeft));

    // Align arrow to trigger center
    const triggerCenter = triggerRect.left + (triggerRect.width / 2);
    const arrowLeft = Math.max(12, Math.min(triggerCenter - clampedLeft, tooltipWidth - 12));

    setCoords({
      top: Math.round(top),
      left: Math.round(clampedLeft),
      arrowLeft: Math.round(arrowLeft),
      actualSide: chosenSide,
    });
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, text]);

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    const handleClickOutside = (event) => {
      if (
        triggerRef.current && !triggerRef.current.contains(event.target) &&
        tooltipRef.current && !tooltipRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const arrowClasses = coords.actualSide === 'bottom'
    ? 'bottom-full border-b-slate-800 border-4 border-transparent'
    : 'top-full border-t-slate-800 border-4 border-transparent';

  return (
    <>
      <span 
        ref={triggerRef}
        className="inline-flex items-center cursor-pointer select-none" 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
      </span>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            zIndex: 99999,
          }}
          className="w-max max-w-[260px] bg-slate-800/95 backdrop-blur-md text-white text-[11px] font-medium leading-tight px-3 py-2 rounded-xl shadow-2xl border border-slate-700/80 whitespace-normal text-left pointer-events-none transition-opacity duration-150 animate-in fade-in"
        >
          {text}
          <div 
            className={`absolute ${arrowClasses}`}
            style={{ left: `${coords.arrowLeft}px`, transform: 'translateX(-50%)' }}
          />
        </div>,
        document.body
      )}
    </>
  );
}
