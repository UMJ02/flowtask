import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { OperationsOverview } from '@/components/reports/operations-overview';
import { getReportsOverview } from '@/lib/queries/reports';

const REPORT_ACTIONS = [
  { href: '/app/reports/print?type=summary', label: 'Resumen PDF', primary: false },
  { href: '/app/reports/print?type=operations', label: 'Operación PDF', primary: true },
  { href: '/app/reports/print?type=executive', label: 'Ejecutivo PDF', primary: false },
  { href: '/app/reports/print?type=planning', label: 'Planning PDF', primary: false },
  { href: '/app/reports/print?type=control', label: 'Control PDF', primary: false },
  { href: '/app/reports/print?type=risk', label: 'Risk PDF', primary: false },
  { href: '/app/reports/print?type=intelligence', label: 'Intelligence PDF', primary: false },
  { href: '/app/reports/print?type=execution', label: 'Execution PDF', primary: false },
];

export default async function ReportsPage() {
  const summary = await getReportsOverview();

  return (
    <div className="page-grid">
      <SectionHeader
        eyebrow="Reporting"
        title="Reportes"
        description="Consolida operación, lectura ejecutiva y seguimiento semanal sin salir del workspace."
        icon={<BarChart3 className="h-5 w-5" />}
      />

      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Salida rápida</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Exporta sin desorden</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Agrupa los PDFs por prioridad y abre la salida correcta según la reunión o revisión que tengas.</p>
          </div>
          <div className="grid w-full gap-2 sm:grid-cols-2 xl:max-w-[760px] xl:grid-cols-4">
            {REPORT_ACTIONS.map((action) => (
              <Link key={action.href} href={action.href} target="_blank">
                <Button variant={action.primary ? 'primary' : 'secondary'} className="w-full justify-between">
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </Card>

      <OperationsOverview summary={summary} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Exportación CSV</h2>
          <p className="mt-2 text-sm text-slate-600">Descarga listados limpios de tareas y proyectos para Excel o Google Sheets.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/api/export/tasks"><Button>Tareas CSV</Button></Link>
            <Link href="/api/export/projects"><Button variant="secondary">Proyectos CSV</Button></Link>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Ruta de cierre semanal</h2>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
            <div className="rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-3">1. Revisa el radar de atención y resuelve tareas vencidas.</div>
            <div className="rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-3">2. Exporta el resumen operativo o ejecutivo según la reunión que tengas.</div>
            <div className="rounded-[12px] border border-slate-200 bg-slate-50 px-4 py-3">3. Usa el watchlist de proyectos para compartir riesgos con clientes o equipo.</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
