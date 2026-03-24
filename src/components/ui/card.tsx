import { cn } from '@/lib/utils/classnames';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'interactive-surface min-w-0 overflow-hidden rounded-[14px] border border-slate-200/90 bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,0.05)] md:p-5',
        className,
      )}
    >
      {children}
    </div>
  );
}
