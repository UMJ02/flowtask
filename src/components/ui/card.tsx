import { cn } from "@/lib/utils/classnames";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-[24px] bg-white p-5 shadow-soft", className)}>{children}</div>;
}
