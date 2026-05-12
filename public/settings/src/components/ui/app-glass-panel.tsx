import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

type GlassVariant = "panel" | "toolbar" | "popover" | "drawer" | "command";

const variantClass: Record<GlassVariant, string> = {
  panel: "ft-glass-panel",
  toolbar: "ft-glass-toolbar",
  popover: "ft-popover-surface",
  drawer: "ft-drawer-surface",
  command: "ft-command-surface",
};

export function AppGlassPanel({ children, className, variant = "panel", ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode; variant?: GlassVariant }) {
  return (
    <div className={cn(variantClass[variant], className)} {...props}>
      {children}
    </div>
  );
}
