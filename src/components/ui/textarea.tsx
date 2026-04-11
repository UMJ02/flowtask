import * as React from "react";
import { cn } from "@/lib/utils/classnames";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-24 w-full rounded-[16px] border border-slate-200/90 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
