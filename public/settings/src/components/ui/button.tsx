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
        "ft-btn",
        size === "md" && "ft-btn-md",
        size === "lg" && "ft-btn-lg",
        size === "sm" && "ft-btn-sm",
        size === "icon" && "ft-btn-icon",
        variant === "primary" && "ft-btn-primary",
        variant === "secondary" && "ft-btn-secondary",
        variant === "ghost" && "ft-btn-ghost",
        variant === "danger" && "ft-btn-danger",
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
