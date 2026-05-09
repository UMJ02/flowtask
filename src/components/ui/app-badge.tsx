import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

type AppBadgeProps = {
  children: ReactNode;
  tone?: "success" | "warning" | "danger" | "info" | "neutral" | "brand";
  className?: string;
};

const tones = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  neutral: "border-slate-200 bg-slate-100 text-slate-700",
  brand: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function AppBadge({ children, tone = "neutral", className }: AppBadgeProps) {
  return <span className={cn("ft-chip border", tones[tone], className)}>{children}</span>;
}
