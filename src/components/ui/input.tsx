import * as React from "react";
import { cn } from "@/lib/utils/classnames";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10.5 w-full rounded-[16px] border border-slate-200/90 bg-white px-3.5 text-sm text-slate-800 outline-none ring-0 transition placeholder:text-slate-400 focus:border-emerald-300 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
