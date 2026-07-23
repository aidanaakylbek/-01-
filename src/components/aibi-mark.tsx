import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import aiSanaHero from "@/assets/ai-sana-hero.jpg";

type AibiMarkProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  shape?: "circle" | "square";
};

const sizePixels = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 96,
  hero: 208,
};

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
  xl: "w-24 h-24",
  hero: "w-52 h-52 md:w-72 md:h-72",
};

export function AibiMark({
  className,
  label = "AI-Sana",
  size = "md",
  shape = "square",
  style,
  ...props
}: AibiMarkProps) {
  const pixelSize = sizePixels[size];

  return (
    <div
      aria-label={label}
      className={cn(
        "relative shrink-0 bg-surface-container-lowest border border-secondary flex items-center justify-center overflow-hidden shadow-sm",
        shape === "circle" ? "rounded-full" : "rounded-[8px]",
        sizeClasses[size],
        className,
      )}
      role="img"
      style={{
        borderRadius: shape === "circle" ? "9999px" : "8px",
        height: pixelSize,
        minHeight: pixelSize,
        minWidth: pixelSize,
        width: pixelSize,
        ...style,
      }}
      {...props}
    >
      <img
        alt=""
        aria-hidden="true"
        className="h-full w-full object-cover"
        draggable={false}
        height={pixelSize}
        src={aiSanaHero}
        style={{ display: "block", height: "100%", objectFit: "cover", width: "100%" }}
        width={pixelSize}
      />
    </div>
  );
}
