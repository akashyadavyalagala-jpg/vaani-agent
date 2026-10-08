import React from "react";
import { cn } from "../utils";

interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error";
}

export function Chip({ className, variant = "default", children, ...props }: ChipProps) {
  const variants = {
    default: "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)]",
    success: "bg-green-500/10 text-green-500 border border-green-500/20",
    warning: "bg-[var(--turmeric)]/10 text-[var(--turmeric)] border border-[var(--turmeric)]/20",
    error: "bg-[var(--vermilion)]/10 text-[var(--vermilion)] border border-[var(--vermilion)]/20",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-widest",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
