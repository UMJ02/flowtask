import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function ErrorState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Card className="border-rose-100 bg-rose-50/70 text-center">
      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-[20px] bg-white text-rose-600 ring-1 ring-rose-100">
        {icon ?? <AlertTriangle className="h-6 w-6" />}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </Card>
  );
}
