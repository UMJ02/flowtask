import * as React from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils/classnames";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

export function Button({ className, variant = "primary", size = "md", loading = false, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        size === "md" && "h-10 rounded-xl px-4 text-[13px]",
        size === "lg" && "h-11 rounded-[14px] px-5 text-[14px]",
        size === "sm" && "h-8 rounded-lg px-3 text-[12px]",
        size === "icon" && "h-9 w-9 rounded-lg p-0 text-[13px]",
        variant === "primary" && "bg-slate-950 text-white hover:bg-slate-900",
        variant === "secondary" && "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
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
