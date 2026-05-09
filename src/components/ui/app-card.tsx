import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

type AppCardProps = {
  children: ReactNode;
  className?: string;
  variant?: "hero" | "main" | "section" | "compact" | "plain" | "raised" | "floating" | "overlay";
  density?: "compact" | "medium" | "relaxed";
  interactive?: boolean;
};

export function AppCard({ children, className, variant = "section", density, interactive = false }: AppCardProps) {
  return (
    <section
      className={cn(
        variant === "hero" && "ft-hero-card",
        variant === "main" && "ft-main-card",
        variant === "section" && "ft-section-card",
        variant === "compact" && "ft-mini-card",
        variant === "plain" && "ft-surface-card",
        variant === "raised" && "ft-surface-raised p-3",
        variant === "floating" && "ft-surface-floating p-3",
        variant === "overlay" && "ft-surface-overlay p-3.5",
        density === "compact" && "ft-density-compact",
        density === "medium" && "ft-density-medium",
        density === "relaxed" && "ft-density-relaxed",
        interactive && "ft-liquid-hover",
        className,
      )}
    >
      {children}
    </section>
  );
}
