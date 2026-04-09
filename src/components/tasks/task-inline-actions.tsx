'use client';

import { useMemo, useState, useTransition } from 'react';
import { AlertTriangle, CheckCircle2, CircleDot, PauseCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/classnames';

const OPTIONS = [
  { value: 'en_proceso', label: 'En proceso', icon: CircleDot },
  { value: 'en_espera', label: 'En espera', icon: PauseCircle },
  { value: 'concluido', label: 'Concluida', icon: CheckCircle2 },
] as const;

function getMessageForStatus(status: string) {
  const option = OPTIONS.find((item) => item.value === status);
  return option ? `Estado actualizado a ${option.label.toLowerCase()}.` : 'Estado actualizado.';
}

export function TaskInlineActions({ taskId, status }: { taskId: string; status: string }) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const feedbackClassName = useMemo(
    () =>
      feedback?.tone === 'error'
        ? 'border-rose-200 bg-rose-50 text-rose-700'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700',
    [feedback],
  );

  const handleStatus = async (nextStatus: string) => {
    if (nextStatus === currentStatus || isPending) return;

    const previousStatus = currentStatus;
    setFeedback(null);
    setCurrentStatus(nextStatus);

    const supabase = createClient();
    const nextDate = nextStatus === 'en_espera' ? undefined : new Date().toISOString().slice(0, 10);
    const payload = nextStatus === 'en_espera' ? { status: nextStatus } : { status: nextStatus, due_date: nextDate };
    const { error } = await supabase.from('tasks').update(payload).eq('id', taskId);

    if (error) {
      setCurrentStatus(previousStatus);
      setFeedback({
        tone: 'error',
        message: 'No pudimos actualizar el estado. Inténtalo de nuevo.',
      });
      return;
    }

    setFeedback({
      tone: 'success',
      message: getMessageForStatus(nextStatus),
    });

    startTransition(() => router.refresh());
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((item) => {
          const Icon = item.icon;
          const active = currentStatus === item.value;
          return (
            <Button
              key={item.value}
              type="button"
              variant={active ? 'primary' : 'secondary'}
              className="px-3 py-2 text-xs"
              disabled={isPending}
              aria-pressed={active}
              title={active ? `${item.label} (actual)` : `Mover a ${item.label.toLowerCase()}`}
              onClick={() => void handleStatus(item.value)}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </div>

      {feedback ? (
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
            feedbackClassName,
          )}
          role="status"
          aria-live="polite"
        >
          {feedback.tone === 'error' ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          <span>{feedback.message}</span>
        </div>
      ) : null}
    </div>
  );
}
