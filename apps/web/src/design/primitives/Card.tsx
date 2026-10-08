"use client";

import React from "react";
import { cn } from "../utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"div"> {
  gradient?: boolean;
}

export function Card({ className, gradient = false, children, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "relative rounded-3xl overflow-hidden bg-[var(--surface)] border border-[var(--border)]",
        className
      )}
      {...props}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--turmeric)]/5 to-transparent pointer-events-none" />
      )}
      <div className="relative z-10 p-6 md:p-8 h-full flex flex-col">
        {children as React.ReactNode}
      </div>
    </motion.div>
  );
}
