import Link from 'next/link';
import { addDays, format, isAfter, isBefore, isToday, parseISO, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, CalendarRange, CircleAlert, CircleCheckBig } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTasks } from '@/lib/queries/tasks';

type TaskItem = {
  id: string;
  title: string;
  status: string;
  client_name?: string | null;
  due_date?: string | null;
};

function dueBucket(tasks: TaskItem[]) {
  const today = startOfToday();
  const weekEnd = addDays(today, 7);
  const overdue: TaskItem[] = [];
  const todayItems: TaskItem[] = [];
  const upcoming: TaskItem[] = [];
  const noDate: TaskItem[] = [];

  tasks.forEach((task) => {
    if (!task.due_date || task.status === 'concluido') {
      noDate.push(task);
      return;
    }
    const date = parseISO(task.due_date);
    if (isBefore(date, today)) overdue.push(task);
    else if (isToday(date)) todayItems.push(task);
    else if (isAfter(date, today) && !isAfter(date, weekEnd)) upcoming.push(task);
    else noDate.push(task);
  });

  return { overdue, todayItems, upcoming, noDate };
}

function AgendaList({ title, hint, items, tone = 'slate' }: { title: string; hint: string; items: TaskItem[]; tone?: 'rose' | 'emerald' | 'blue' | 'slate'; }) {
  const toneClasses = {
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    slate: 'bg-slate-50 text-slate-700 border-slate-100',
  } as const;

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{hint}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>{items.length}</span>
      </div>

      {items.length ? (
        <div className="space-y-3">
          {items.map((task) => (
            <Link key={task.id} href={`/app/tasks/${task.id}`} className="block rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition hover:border-emerald-200 hover:bg-emerald-50/40">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{task.client_name || 'Sin cliente'} · {task.status.replace('_', ' ')}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                  {task.due_date ? format(parseISO(task.due_date), 'd MMM', { locale: es }) : 'Sin fecha'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          Nada que revisar aquí por ahora.
        </div>
      )}
    </Card>
  );
}

export default async function CalendarPage() {
  const tasks = await getTasks();
  const { overdue, todayItems, upcoming } = dueBucket(tasks);

  return (
    <div className="space-y-4">
      <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            <CalendarDays className="h-4 w-4" />
            Agenda clara
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Calendario</h1>
          <p className="mt-1 text-sm text-slate-500">Revisa rápido lo vencido, lo que toca hoy y lo que viene esta semana.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/app/tasks"><Button variant="secondary">Ver tareas</Button></Link>
          <Link href="/app/tasks/new"><Button>Nueva tarea</Button></Link>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="bg-rose-50/70">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700"><CircleAlert className="h-5 w-5" /></span>
            <div>
              <p className="text-sm text-rose-700">Vencidas</p>
              <p className="text-2xl font-bold text-slate-900">{overdue.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-emerald-50/70">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><CircleCheckBig className="h-5 w-5" /></span>
            <div>
              <p className="text-sm text-emerald-700">Para hoy</p>
              <p className="text-2xl font-bold text-slate-900">{todayItems.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-blue-50/70">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"><CalendarRange className="h-5 w-5" /></span>
            <div>
              <p className="text-sm text-blue-700">Próximos 7 días</p>
              <p className="text-2xl font-bold text-slate-900">{upcoming.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <AgendaList title="Vencidas" hint="Lo que ya pasó de fecha y necesita atención." items={overdue} tone="rose" />
        <AgendaList title="Hoy" hint={`Pendientes para ${format(new Date(), "d 'de' MMMM", { locale: es })}.`} items={todayItems} tone="emerald" />
        <AgendaList title="Esta semana" hint="Lo que viene en los próximos siete días." items={upcoming} tone="blue" />
      </div>
    </div>
  );
}
