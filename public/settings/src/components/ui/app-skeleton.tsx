import { cn } from "@/lib/utils/classnames";

export function AppSkeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("ft-skeleton h-10 w-full", className)} />;
}

export function AppSkeletonStack({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("ft-density-compact", className)} aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <AppSkeleton key={index} className={index === rows - 1 ? "w-2/3" : undefined} />
      ))}
    </div>
  );
}
