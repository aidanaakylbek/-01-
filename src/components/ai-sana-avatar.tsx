import type { HTMLAttributes } from "react";

import aiSanaAvatar from "@/assets/ai-sana-avatar.png";
import { cn } from "@/lib/utils";

type AiSanaAvatarProps = HTMLAttributes<HTMLDivElement> & {
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
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
  xl: "h-24 w-24",
  hero: "h-52 w-52 md:h-72 md:w-72",
};

export function AiSanaAvatar({
  className,
  label = "AI-Sana avatar",
  size = "md",
  shape = "circle",
  style,
  ...props
}: AiSanaAvatarProps) {
  const pixelSize = sizePixels[size];

  return (
    <div
      aria-label={label}
      className={cn(
        "relative shrink-0 overflow-hidden border border-[#DDD6FE] bg-white shadow-sm",
        shape === "circle" ? "rounded-full" : "rounded-[18px]",
        sizeClasses[size],
        className,
      )}
      role="img"
      style={{
        borderRadius: shape === "circle" ? "9999px" : "18px",
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
        className="h-full w-full object-cover object-top"
        draggable={false}
        height={pixelSize}
        src={aiSanaAvatar}
        width={pixelSize}
      />
    </div>
  );
}
