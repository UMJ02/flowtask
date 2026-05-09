import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

export function AppToolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-[22px] border border-slate-200/80 bg-white p-3", className)}>{children}</div>;
}
