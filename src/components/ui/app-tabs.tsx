import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

export function AppTabs({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("ft-animated-tabs", className)}>{children}</div>;
}

export function AppTabButton({ children, active = false, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button type="button" data-active={active ? "true" : "false"} className={cn("ft-motion-tab", className)} {...props}>
      {children}
    </button>
  );
}
