import Link from 'next/link';
import { BarChart3, FileSpreadsheet, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { OperationsOverview } from '@/components/reports/operations-overview';
import { getReportsOverview } from '@/lib/queries/reports';

export default async function ReportsPage() {
  const summary = await getReportsOverview();

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Reporting"
        title="Reportes"
        description="Consolida operación, lectura ejecutiva y seguimiento semanal sin salir del workspace. En v6 la salida de reportes queda más ordenada y más lista para compartir."
        icon={<BarChart3 className="h-5 w-5" />}
        badges={[
          { label: 'Salidas PDF', tone: 'stable' },
          { label: 'CSV listo', tone: 'default' },
          { label: 'Cierre semanal', tone: 'attention' },
        ]}
        actions={
          <>
            <Link href="/app/reports/print?type=summary" target="_blank"><Button variant="secondary">Resumen PDF</Button></Link>
            <Link href="/app/reports/print?type=operations" target="_blank"><Button>Operación PDF</Button></Link>
            <Link href="/app/reports/print?type=executive" target="_blank"><Button variant="secondary">Ejecutivo PDF</Button></Link>
          </>
        }
      />

      <Card className="surface-glow bg-[linear-gradient(135deg,#0f172a_0%,#134e4a_55%,#052e16_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Product polish</p>
            <h2 className="mt-2 text-3xl font-bold">Comparte operación sin fricción</h2>
            <p className="mt-2 text-sm text-emerald-50/85">Usa PDFs cuando ocupes lectura ejecutiva y CSV cuando la conversación pide manipular datos, filtros o validación externa.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-100/80">Formatos</p>
              <p className="mt-2 text-3xl font-bold">2</p>
            </div>
            <div className="rounded-[24px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-100/80">Ruta ideal</p>
              <p className="mt-2 text-3xl font-bold">PDF + CSV</p>
            </div>
          </div>
        </div>
      </Card>

      <OperationsOverview summary={summary} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="surface-glow">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Exportación CSV</h2>
              <p className="mt-2 text-sm text-slate-600">Descarga listados limpios de tareas y proyectos para Excel o Google Sheets sin pasar por vistas intermedias.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/api/export/tasks"><Button>Tareas CSV</Button></Link>
            <Link href="/api/export/projects"><Button variant="secondary">Proyectos CSV</Button></Link>
          </div>
        </Card>

        <Card className="surface-glow">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
              <Printer className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Ruta de cierre semanal</h2>
              <p className="mt-2 text-sm text-slate-600">Una secuencia simple para salir con conversación clara y material listo para compartir.</p>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">1. Revisa el radar de atención y resuelve tareas vencidas.</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">2. Exporta el resumen operativo o ejecutivo según la reunión que tengas.</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">3. Usa el watchlist de proyectos para compartir riesgos con clientes o equipo.</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/app/reports/print?type=risk" target="_blank"><Button variant="secondary">Risk PDF</Button></Link>
            <Link href="/app/reports/print?type=intelligence" target="_blank"><Button variant="secondary">Intelligence PDF</Button></Link>
            <Link href="/app/reports/print?type=execution" target="_blank"><Button variant="secondary">Execution PDF</Button></Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
