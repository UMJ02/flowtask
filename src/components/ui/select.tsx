import * as React from "react";
import { cn } from "@/lib/utils/classnames";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "h-10 w-full rounded-xl border border-slate-200/90 bg-white px-3 text-sm outline-none transition-all focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50",
          className,
        )}
        {...props}
      />
    );
  },
);

Select.displayName = "Select";
