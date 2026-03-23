import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';

export function TaskCard({ title, status, clientName, dueDate }: { title: string; status: string; clientName?: string | null; dueDate?: string | null }) {
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <StatusBadge value={status} />
      </div>
      <p className="text-sm text-slate-500">Cliente: {clientName || 'Sin cliente'}</p>
      <p className="text-sm text-slate-500">Deadline: {dueDate || 'Sin definir'}</p>
    </Card>
  );
}
