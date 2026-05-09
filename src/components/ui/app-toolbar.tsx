import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

export function AppToolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-[16px] border border-slate-200/75 bg-white p-2.5", className)}>{children}</div>;
}
