import * as React from "react";
import { cn } from "@/lib/utils";

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default:
      "bg-[#f5f2ef] text-[#5c5a57] border-[#e8e4e0] [&>svg]:text-[#9c9894]",
    destructive:
      "bg-[#f5d5d5] text-[#8b4545] border-[#e8b4b4] [&>svg]:text-[#8b4545]",
  };
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-[#5c5a57]",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Alert.displayName = "Alert";

export { Alert };
