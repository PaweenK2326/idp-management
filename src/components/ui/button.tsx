import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-[#8ab4e0] text-[#2d4a6a] hover:bg-[#7aa3d4]",
      destructive: "bg-[#e8b4b4] text-[#8b4545] hover:bg-[#dd9e9e]",
      outline: "border border-[#e8e4e0] bg-white hover:bg-[#f5f2ef]",
      secondary: "bg-[#e8e4e0] text-[#5c5a57] hover:bg-[#ddd9d5]",
      ghost: "hover:bg-[#f0ede9]",
      link: "text-[#5c5a57] underline-offset-4 hover:underline",
    };
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
