import * as React from "react";
import { cn } from "@/lib/utils/classnames";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-2xl border border-slate-200/90 bg-white/98 px-3.5 text-[14px] text-slate-900 outline-none ring-0 transition-all placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
