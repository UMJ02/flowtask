import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

export function AppToolbar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-[28px] border border-[#E7ECF3] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]", className)}>{children}</div>;
}
