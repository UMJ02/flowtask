import * as React from "react";
import { cn } from "@/lib/utils/classnames";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none ring-0 transition duration-150 placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
