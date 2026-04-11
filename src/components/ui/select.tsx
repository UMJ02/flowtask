import * as React from "react";
import { cn } from "@/lib/utils/classnames";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "h-10.5 w-full rounded-[16px] border border-slate-200/90 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Select.displayName = "Select";
