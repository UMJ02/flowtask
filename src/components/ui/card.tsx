import { cn } from '@/lib/utils/classnames';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'min-w-0 overflow-hidden rounded-[18px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] backdrop-blur supports-[backdrop-filter]:bg-white/88 md:p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}
