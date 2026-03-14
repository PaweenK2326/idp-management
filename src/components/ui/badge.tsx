import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-[#8ab4e0] text-[#2d4a6a]",
    secondary: "border-transparent bg-[#e8e4e0] text-[#5c5a57]",
    destructive: "border-transparent bg-[#e8c4c4] text-[#8b4545]",
    outline: "text-[#5c5a57] border-[#e8e4e0]",
  };
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
