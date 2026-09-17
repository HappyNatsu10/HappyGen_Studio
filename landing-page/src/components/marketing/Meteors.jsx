import { cn } from "../../lib/utils";
import React, { useEffect, useState } from "react";

export const Meteors = ({
  number = 20,
  className,
}) => {
  const [meteors, setMeteors] = useState([]);

  useEffect(() => {
    const generateMeteors = () => {
      return new Array(number).fill(true).map(() => ({
        id: Math.random().toString(36).substr(2, 9),
        left: Math.floor(Math.random() * (400 - -400) + -400) + "px",
        animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
        animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
      }));
    };
    setMeteors(generateMeteors());
  }, [number]);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes meteor {
          0% { transform: rotate(215deg) translateX(0); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: rotate(215deg) translateX(-500px); opacity: 0; }
        }
        .animate-meteor-effect {
          animation: meteor 5s linear infinite;
        }
      `}} />
      {meteors.map((el) => (
        <span
          key={el.id}
          className={cn(
            "animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent",
            className
          )}
          style={{
            top: 0,
            left: el.left,
            animationDelay: el.animationDelay,
            animationDuration: el.animationDuration,
          }}
        ></span>
      ))}
    </>
  );
};
