import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';

export function TaskCard({ title, status, clientName, dueDate }: { title: string; status: string; clientName?: string | null; dueDate?: string | null }) {
  return (
    <Card className="ft-card space-y-3 p-4">
      <div className="flex items-start justify-between gap-4">
        <h3 className="ft-task-title">{title}</h3>
        <StatusBadge value={status} />
      </div>
      <p className="ft-task-muted">Cliente: {clientName || 'Sin cliente'}</p>
      <p className="ft-task-muted">Deadline: {dueDate || 'Sin definir'}</p>
    </Card>
  );
}
