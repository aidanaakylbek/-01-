import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import aiSanaHero from "@/assets/ai-sana-hero.jpg";

type AibiMarkProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
};

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
};

export function AibiMark({
  className,
  label = "AI-Sana",
  size = "md",
  shape = "square",
  ...props
}: AibiMarkProps) {
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
      {...props}
    >
      <img
        alt=""
        aria-hidden="true"
        className="h-full w-full object-cover"
        draggable={false}
        src={aiSanaHero}
      />
    </div>
  );
}
