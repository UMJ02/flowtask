import { cn } from '@/lib/utils/classnames';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'card-premium min-w-0 overflow-hidden rounded-[14px] border border-slate-200/85 bg-white/[0.96] p-3 shadow-[0_10px_24px_rgba(15,23,42,0.045)] backdrop-blur transition-[box-shadow,border-color,transform] duration-200 md:p-3.5',
        className,
      )}
    >
      {children}
    </div>
  );
}
