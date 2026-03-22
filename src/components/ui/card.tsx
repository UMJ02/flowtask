import { cn } from '@/lib/utils/classnames';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'min-w-0 overflow-hidden rounded-[30px] border border-white/70 bg-white/95 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur',
        className,
      )}
    >
      {children}
    </div>
  );
}
