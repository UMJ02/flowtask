import type { ReactNode } from "react";
import { cn } from "@/lib/utils/classnames";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("ft-section-card min-w-0 overflow-hidden", className)}>
      {children}
    </div>
  );
}
