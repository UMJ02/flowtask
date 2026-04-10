import { cn } from '@/lib/utils/classnames';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'min-w-0 overflow-hidden rounded-[15px] border border-slate-200/80 bg-white/[0.95] p-3.5 shadow-[0_8px_22px_rgba(15,23,42,0.045)] backdrop-blur md:p-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
