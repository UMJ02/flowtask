import { Card } from '@/components/ui/card';
import type { AdminMetricSummary } from '@/types/admin';

export function AdminMetricsPanel({ metrics }: { metrics: AdminMetricSummary }) {
  const items = [
    { label: 'Organizaciones', value: metrics.organizations, hint: 'Cuentas activas detectadas en la plataforma' },
    { label: 'Usuarios', value: metrics.users, hint: 'Miembros únicos vinculados a organizaciones' },
    { label: 'Suscripciones activas', value: metrics.activeSubscriptions, hint: 'Trial, activas o con cobro pendiente' },
    { label: 'Soporte abierto', value: metrics.openSupportTickets, hint: 'Casos abiertos o en proceso hoy' },
    { label: 'Eventos 7 días', value: metrics.usageEvents7d, hint: 'Actividad reciente en uso real del sistema' },
    { label: 'Errores críticos 7 días', value: metrics.criticalErrors7d, hint: 'Incidentes de mayor severidad a vigilar' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label} className="rounded-[24px] border border-slate-200/80 bg-white/[0.96]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{item.value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.hint}</p>
        </Card>
      ))}
    </div>
  );
}
