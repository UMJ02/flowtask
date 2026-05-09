import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

type AppCardProps = {
  children: ReactNode;
  className?: string;
  variant?: "hero" | "main" | "section" | "compact" | "plain" | "floating";
  interactive?: boolean;
};

export function AppCard({ children, className, variant = "section", interactive = false }: AppCardProps) {
  return (
    <section
      className={cn(
        variant === "hero" && "rounded-[20px] border border-slate-200/80 bg-white p-4 md:p-4",
        variant === "main" && "ft-main-card",
        variant === "section" && "ft-section-card",
        variant === "compact" && "ft-mini-card",
        variant === "plain" && "rounded-[20px] border border-slate-200/80 bg-white",
        variant === "floating" && "ft-floating-card p-4",
        interactive && "ft-hover-lift",
        className,
      )}
    >
      {children}
    </section>
  );
}
