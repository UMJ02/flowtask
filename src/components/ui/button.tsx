import * as React from "react";
import { cn } from "@/lib/utils/classnames";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition",
        variant === "primary" && "bg-slate-900 text-white hover:bg-slate-800",
        variant === "secondary" && "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
        variant === "ghost" && "bg-transparent text-slate-700 hover:bg-slate-100",
        className,
      )}
      {...props}
    />
  );
}
