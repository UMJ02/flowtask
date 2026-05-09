import * as React from "react";
import { cn } from "@/lib/utils/classnames";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-[112px] w-full rounded-[14px] border border-slate-200 bg-white px-3.5 py-3 text-[14px] text-slate-900 outline-none transition duration-150 placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
