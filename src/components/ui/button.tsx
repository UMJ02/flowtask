import * as React from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils/classnames";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
  loading?: boolean;
}

export function Button({ className, variant = "primary", size = "md", loading = false, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        size === "md" && "h-11 rounded-2xl px-5 text-[14px]",
        size === "sm" && "h-9 rounded-xl px-3 text-[12px]",
        size === "icon" && "h-10 w-10 rounded-xl p-0 text-[14px]",
        variant === "primary" && "bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.10)] hover:-translate-y-0.5 hover:bg-slate-900",
        variant === "secondary" && "border border-[#E7ECF3] bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:bg-slate-50",
        variant === "ghost" && "bg-transparent text-slate-700 hover:bg-slate-100/80",
        variant === "danger" && "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
