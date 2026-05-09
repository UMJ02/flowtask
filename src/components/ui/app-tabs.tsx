import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

export function AppTabs({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-1 rounded-xl border border-slate-200/80 bg-white p-1", className)}>{children}</div>;
}
