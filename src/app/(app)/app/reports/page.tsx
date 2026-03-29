import Link from 'next/link';
import { ArrowUpRight, BarChart3, Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExpandableBar } from '@/components/ui/expandable-bar';
import { SectionHeader } from '@/components/ui/section-header';
import { OperationsOverview } from '@/components/reports/operations-overview';
import { getReportsOverview } from '@/lib/queries/reports';

const REPORT_GROUPS = [
  {
    title: 'Primarios',
    description: 'Los que más se usan para revisar estado y compartir con dirección.',
    actions: [
      { href: '/app/reports/print?type=summary', label: 'Resumen PDF', primary: false },
      { href: '/app/reports/print?type=operations', label: 'Operación PDF', primary: true },
      { href: '/app/reports/print?type=executive', label: 'Ejecutivo PDF', primary: false },
    ],
  },
  {
    title: 'Especializados',
    description: 'Salidas para planning, control, riesgo, intelligence y ejecución.',
    actions: [
      { href: '/app/reports/print?type=planning', label: 'Planning PDF' },
      { href: '/app/reports/print?type=control', label: 'Control PDF' },
      { href: '/app/reports/print?type=risk', label: 'Risk PDF' },
      { href: '/app/reports/print?type=intelligence', label: 'Intelligence PDF' },
      { href: '/app/reports/print?type=execution', label: 'Execution PDF' },
    ],
  },
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

      <ExpandableBar
        eyebrow="Exportación"
        title="Salidas PDF"
        description="Abre esta barra para elegir el formato correcto según el tipo de revisión."
        defaultOpen
      >
        <div className="grid gap-3 lg:grid-cols-2">
          {REPORT_GROUPS.map((group) => (
            <div key={group.title} className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{group.title}</p>
              <p className="mt-2 text-sm text-slate-500">{group.description}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {group.actions.map((action) => (
                  <Link key={action.href} href={action.href} target="_blank">
                    <Button variant={action.primary ? 'primary' : 'secondary'} className="w-full justify-between">
                      {action.label}
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ExpandableBar>

      <OperationsOverview summary={summary} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Exportación CSV</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Datos para hojas</h2>
              <p className="mt-2 text-sm text-slate-600">Descarga listados limpios de tareas y proyectos para Excel o Google Sheets.</p>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700 ring-1 ring-slate-200">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link href="/api/export/tasks"><Button className="w-full justify-between">Tareas CSV <Download className="h-4 w-4" /></Button></Link>
            <Link href="/api/export/projects"><Button variant="secondary" className="w-full justify-between">Proyectos CSV <Download className="h-4 w-4" /></Button></Link>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Ruta de cierre semanal</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Secuencia recomendada</h2>
          <div className="mt-4 grid gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">1. Revisa el radar de atención y resuelve tareas vencidas.</div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">2. Exporta el resumen operativo o ejecutivo según la reunión que tengas.</div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">3. Usa el watchlist de proyectos para compartir riesgos con clientes o equipo.</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
