import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

export function AppToolbar({ children, className, density = "compact" }: { children: ReactNode; className?: string; density?: "compact" | "medium" }) {
  return <div className={cn("ft-toolbar", density === "compact" ? "ft-density-compact" : "ft-density-medium", className)}>{children}</div>;
}
