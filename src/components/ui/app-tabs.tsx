import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

export function AppTabs({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("ft-tabs", className)}>{children}</div>;
}
