import { cn } from '@/lib/utils/classnames';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'min-w-0 overflow-hidden rounded-[18px] border border-white/80 bg-white/[0.92] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur md:p-5',
        className,
      )}
    >
      {children}
    </div>
  );
}
