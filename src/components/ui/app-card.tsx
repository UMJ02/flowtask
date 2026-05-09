import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

type AppCardProps = {
  children: ReactNode;
  className?: string;
  variant?: "main" | "section" | "compact" | "plain";
  interactive?: boolean;
};

export function AppCard({ children, className, variant = "section", interactive = false }: AppCardProps) {
  return (
    <section
      className={cn(
        variant === "main" && "ft-main-card",
        variant === "section" && "ft-section-card",
        variant === "compact" && "ft-mini-card",
        variant === "plain" && "rounded-3xl border border-[#E7ECF3] bg-white",
        interactive && "ft-hover-lift",
        className,
      )}
    >
      {children}
    </section>
  );
}
