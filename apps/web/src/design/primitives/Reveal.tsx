"use client";

import React, { useMemo, useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { cn } from "../utils";

interface RevealProps {
  text: string;
  className?: string;
  delay?: number;
  as?: React.ElementType;
  splitBy?: "word" | "grapheme" | "line";
}

export function Reveal({
  text,
  className,
  delay = 0,
  as = "span",
  splitBy = "word",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  const segments = useMemo(() => {
    if (splitBy === "line") {
      return text.split("\n");
    }
    
    // Safely segment text. Crucial for Telugu where conjuncts shouldn't be split.
    const segmenter = new Intl.Segmenter("te-IN", { granularity: splitBy });
    return Array.from(segmenter.segment(text)).map((s) => s.segment);
  }, [text, splitBy]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: splitBy === "grapheme" ? 0.03 : 0.08,
        delayChildren: delay,
      },
    },
  };

  const childVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
      },
    },
  };

  const Component = motion.create(as as any);

  return (
    <Component
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={cn("flex flex-wrap", className)}
      aria-label={text}
    >
      {segments.map((segment, i) => (
        <motion.span
          key={i}
          variants={childVariants}
          className={cn(
            "inline-block",
            splitBy === "word" && segment.trim() === "" ? "w-[0.25em]" : ""
          )}
          aria-hidden="true"
        >
          {segment === " " ? "\u00A0" : segment}
        </motion.span>
      ))}
    </Component>
  );
}
