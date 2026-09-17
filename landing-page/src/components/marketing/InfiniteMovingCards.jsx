import React, { useEffect, useState, useRef } from "react";
import { cn } from "../../lib/utils";

// If you don't have clsx/tailwind-merge setup in lib/utils, 
// make sure to install them or just use template literals. We'll assume cn is available or we use basic template literals.
// Wait, the project package.json has clsx and tailwind-merge, so I'll create a basic utils file if it doesn't exist, but I'll just use inline styles/classes here to be safe.

import { Cpu } from "lucide-react";

const getProviderLogoUrl = (provider) => {
  const p = provider.toUpperCase();
  const getFavicon = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  
  if (p.includes('OPENAI')) return getFavicon('openai.com');
  if (p.includes('GOOGLE')) return getFavicon('google.com');
  if (p.includes('MICROSOFT')) return getFavicon('microsoft.com');
  if (p.includes('ALIBABA')) return getFavicon('alibaba.com');
  if (p.includes('BAIDU')) return getFavicon('baidu.com');
  if (p.includes('XAI')) return getFavicon('x.ai');
  if (p.includes('BYTEDANCE')) return getFavicon('bytedance.com');
  if (p.includes('STABILITY')) return getFavicon('stability.ai');
  if (p.includes('RUNWAY')) return getFavicon('runwayml.com');
  if (p.includes('LUMA')) return getFavicon('lumaai.com');
  if (p.includes('PIKA')) return getFavicon('pika.art');
  if (p.includes('BLACK FOREST')) return getFavicon('blackforestlabs.ai');
  if (p.includes('KREA')) return getFavicon('krea.ai');
  if (p.includes('KUAISHOU')) return getFavicon('kuaishou.com');
  if (p.includes('LIGHTRICKS')) return getFavicon('lightricks.com');
  if (p.includes('SHENGSHU')) return getFavicon('shengshu-ai.com'); 
  if (p.includes('HAIPER')) return getFavicon('haiper.ai');
  return null;
};

const ProviderLogo = ({ provider }) => {
  const logoUrl = getProviderLogoUrl(provider);
  const [error, setError] = useState(false);

  if (!logoUrl || error) {
    return <Cpu className="w-5 h-5 text-slate-400 opacity-80" />;
  }

  return (
    <img 
      src={logoUrl} 
      alt={provider} 
      onError={() => setError(true)}
      className="w-6 h-6 object-contain rounded-sm" 
    />
  );
};

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}) => {
  const containerRef = useRef(null);
  const scrollerRef = useRef(null);

  useEffect(() => {
    addAnimation();
  }, []);

  const [start, setStart] = useState(false);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty("--animation-direction", "forwards");
      } else {
        containerRef.current.style.setProperty("--animation-direction", "reverse");
      }
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      } else if (speed === "slow") {
        containerRef.current.style.setProperty("--animation-duration", "160s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "160s");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`scroller relative z-20 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)] ${className || ""}`}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll {
          to {
            transform: translate(calc(-50% - 0.5rem));
          }
        }
        .animate-scroll {
          animation: scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite;
        }
      `}} />
      
      <ul
        ref={scrollerRef}
        className={`flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap ${
          start ? "animate-scroll" : ""
        } ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""}`}
      >
        {items.map((item, idx) => (
          <li
            className="w-[250px] max-w-full relative rounded-2xl border border-[var(--border-subtle)] flex-shrink-0 px-8 py-6 md:w-[320px] shadow-lg shadow-purple-500/5 transition-colors hover:border-purple-500/30"
            style={{
              background: "linear-gradient(180deg, var(--surface-1), var(--surface-0))",
            }}
            key={item.id + idx}
          >
            <blockquote>
              <div
                aria-hidden="true"
                className="user-select-none -z-1 pointer-events-none absolute -left-0.5 -top-0.5 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
              ></div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-3)] flex items-center justify-center border border-[var(--border-subtle)] flex-shrink-0">
                  <ProviderLogo provider={item.provider} />
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="relative z-20 text-base leading-[1.6] text-white font-bold truncate max-w-[200px]">
                    {item.name}
                  </span>
                  <span className="text-sm leading-[1.6] text-slate-400 font-medium truncate max-w-[200px]">
                    {item.provider}
                  </span>
                  <span className="text-[10px] leading-[1.6] text-purple-400 font-bold tracking-wider uppercase mt-1">
                    {item.type} Engine
                  </span>
                </div>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};
