'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, CircleDot, PauseCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

const OPTIONS = [
  { value: 'en_proceso', label: 'En proceso', icon: CircleDot },
  { value: 'en_espera', label: 'En espera', icon: PauseCircle },
  { value: 'concluido', label: 'Concluida', icon: CheckCircle2 },
] as const;

export function TaskInlineActions({ taskId, status }: { taskId: string; status: string }) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isPending, startTransition] = useTransition();

  const handleStatus = async (nextStatus: string) => {
    if (nextStatus === currentStatus) return;
    setCurrentStatus(nextStatus);
    const supabase = createClient();
    const { error } = await supabase.from('tasks').update({ status: nextStatus }).eq('id', taskId);
    if (error) {
      setCurrentStatus(status);
      return;
    }
    startTransition(() => router.refresh());
  };

  return (
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
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleStatus(item.value);
            }}
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </Button>
        );
      })}
    </div>
  );
}
