"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [cursorState, setCursorState] = useState<'default' | 'interacting' | 'orb'>('default');
  const [isVisible, setIsVisible] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth out the mouse movement for the ring
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Check if device supports hover and pointer is fine (not a touch screen)
    const hasHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!hasHover) return;

    setIsVisible(true);

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const orbEl = target.closest('[data-cursor="orb"]');
      if (orbEl) {
        setCursorState('orb');
        return;
      }
      
      if (
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest('[data-cursor="interact"]')
      ) {
        setCursorState('interacting');
        return;
      }
      
      setCursorState('default');
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <>
      {/* Small Dot (follows exact cursor, no spring) */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[10000]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          opacity: cursorState === 'orb' ? 0 : 1,
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Outer Ring (uses spring physics) */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] border flex items-center justify-center overflow-hidden"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: cursorState === 'orb' ? 64 : cursorState === 'interacting' ? 48 : 32,
          height: cursorState === 'orb' ? 64 : cursorState === 'interacting' ? 48 : 32,
          borderColor: cursorState === 'orb' ? 'rgba(255,255,255,0.2)' : cursorState === 'interacting' ? '#7b2cbf' : 'rgba(255,255,255,0.5)',
          backgroundColor: cursorState === 'orb' ? 'rgba(255,255,255,0.05)' : cursorState === 'interacting' ? 'rgba(123, 44, 191, 0.05)' : 'transparent',
          backdropFilter: cursorState === 'orb' ? 'blur(4px)' : 'none',
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Inner Text for Orb state */}
        <motion.div
          className="font-mono text-[10px] text-white font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: cursorState === 'orb' ? 1 : 0 }}
        >
          Talk
        </motion.div>
      </motion.div>
    </>
  );
}
