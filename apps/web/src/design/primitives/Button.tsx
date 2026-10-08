"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../utils";

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  magnetic?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      magnetic = true,
      children,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!magnetic || !internalRef.current) return;
      const { clientX, clientY } = e;
      const { height, width, left, top } =
        internalRef.current.getBoundingClientRect();
      const middleX = clientX - (left + width / 2);
      const middleY = clientY - (top + height / 2);
      setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
    };

    const reset = () => {
      setPosition({ x: 0, y: 0 });
    };

    const variants = {
      primary: "bg-[var(--turmeric)] text-[var(--ink)] hover:bg-opacity-90 font-medium",
      secondary: "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--muted)]",
      outline: "bg-transparent border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--muted)]",
      ghost: "bg-transparent text-[var(--foreground)] hover:bg-[var(--surface)]",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <motion.button
        ref={(node) => {
          // Sync both refs
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
          // @ts-ignore
          internalRef.current = node;
        }}
        onMouseMove={handleMouse}
        onMouseLeave={reset}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.5 }}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--turmeric)] disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
