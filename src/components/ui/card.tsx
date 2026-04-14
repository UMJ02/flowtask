import { cn } from '@/lib/utils/classnames';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'min-w-0 overflow-hidden rounded-[16px] border border-slate-200/75 bg-white/[0.97] p-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)] ring-1 ring-white/80 backdrop-blur md:p-3.5',
        className,
      )}
    >
      {children}
    </div>
  );
}
