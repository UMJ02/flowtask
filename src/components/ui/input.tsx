import * as React from "react";
import { cn } from "@/lib/utils/classnames";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-slate-400 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
