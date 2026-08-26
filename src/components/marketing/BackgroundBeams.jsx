"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const BackgroundBeams = ({
  className,
}) => {
  return (
    <div
      className={cn(
        "absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-40",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-0)] via-transparent to-transparent z-10" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="w-full h-full overflow-hidden absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            <pattern
              id="pattern-beams"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
              patternTransform="scale(1) rotate(0)"
            >
              <rect width="100%" height="100%" fill="none" />
              <path
                d="M0 40V0h40"
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pattern-beams)" />
        </svg>
        <div className="absolute left-1/4 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-purple-500 to-transparent blur-[2px]" />
        <div className="absolute left-3/4 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-indigo-500 to-transparent blur-[2px]" />
        
        {/* Animated particles moving down */}
        <motion.div
          animate={{
            y: ["-10%", "110%"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute left-[24.9%] top-0 h-32 w-1 bg-gradient-to-b from-transparent via-white to-transparent blur-[2px]"
        />
        <motion.div
          animate={{
            y: ["-10%", "110%"],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
            delay: 2,
          }}
          className="absolute left-[74.9%] top-0 h-48 w-1 bg-gradient-to-b from-transparent via-white to-transparent blur-[2px]"
        />
      </motion.div>
    </div>
  );
};
