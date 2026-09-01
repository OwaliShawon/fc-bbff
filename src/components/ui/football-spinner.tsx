"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FootballSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  text?: string;
  className?: string;
}

export function FootballSpinner({
  size = "md",
  text,
  className,
}: FootballSpinnerProps) {
  const sizeClasses = {
    sm: "text-lg h-8 w-8",
    md: "text-3xl h-12 w-12",
    lg: "text-5xl h-20 w-20",
    xl: "text-7xl h-28 w-28",
    full: "text-6xl h-24 w-24",
  };

  const spinnerContent = (
    <div className={cn("flex flex-col items-center justify-center gap-3 select-none", className)}>
      <div className="relative flex items-center justify-center">
        {/* Ambient Glow Aura */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
        
        {/* Spinning Football Icon */}
        <span
          className={cn(
            "relative z-10 inline-block animate-spin leading-none drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]",
            sizeClasses[size]
          )}
          style={{ animationDuration: "1.2s" }}
        >
          ⚽
        </span>
      </div>

      {text && (
        <p className="text-xs sm:text-sm font-bold tracking-wider text-emerald-400 uppercase animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (size === "full") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950/90 backdrop-blur-md">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
}
