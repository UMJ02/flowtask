import { cn } from '@/lib/utils/classnames';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'min-w-0 overflow-hidden rounded-[16px] border border-slate-200/80 bg-white/[0.94] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] backdrop-blur md:p-[1.05rem]',
        className,
      )}
    >
      {children}
    </div>
  );
}
