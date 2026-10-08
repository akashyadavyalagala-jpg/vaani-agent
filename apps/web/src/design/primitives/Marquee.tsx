"use client";

import React, { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, useVelocity, useAnimationFrame, useMotionValue } from "framer-motion";
const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};
interface MarqueeProps {
  children: React.ReactNode;
  baseVelocity?: number;
  className?: string;
}

export function Marquee({ children, baseVelocity = 100, className }: MarqueeProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false
  });

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);
  const directionFactor = useRef<number>(1);

  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className={`overflow-hidden m-0 flex whitespace-nowrap flex-nowrap ${className || ""}`}>
      <motion.div className="flex whitespace-nowrap flex-nowrap uppercase items-center font-serif text-[var(--font-size-hero)]" style={{ x }}>
        <span className="block mr-10">{children} </span>
        <span className="block mr-10">{children} </span>
        <span className="block mr-10">{children} </span>
        <span className="block mr-10">{children} </span>
      </motion.div>
    </div>
  );
}


