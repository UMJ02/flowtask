import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

type AppCardProps = {
  children: ReactNode;
  className?: string;
  variant?: "hero" | "main" | "section" | "compact" | "plain" | "raised" | "floating" | "overlay";
  interactive?: boolean;
};

export function AppCard({ children, className, variant = "section", interactive = false }: AppCardProps) {
  return (
    <section
      className={cn(
        variant === "hero" && "ft-hero-card",
        variant === "main" && "ft-main-card",
        variant === "section" && "ft-section-card",
        variant === "compact" && "ft-mini-card",
        variant === "plain" && "rounded-[16px] border border-slate-200/75 bg-white",
        variant === "raised" && "ft-raised-card p-3",
        variant === "floating" && "ft-floating-card p-3",
        variant === "overlay" && "ft-overlay-card p-3.5",
        interactive && "ft-hover-lift",
        className,
      )}
    >
      {children}
    </section>
  );
}
