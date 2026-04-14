import { cn } from '@/lib/utils/classnames';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'min-w-0 overflow-hidden rounded-[18px] border border-slate-200/80 bg-white/[0.98] p-3 shadow-[0_14px_32px_rgba(15,23,42,0.05)] ring-1 ring-white/80 backdrop-blur md:p-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
