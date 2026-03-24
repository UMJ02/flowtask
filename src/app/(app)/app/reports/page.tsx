import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { OperationsOverview } from '@/components/reports/operations-overview';
import { getReportsOverview } from '@/lib/queries/reports';

export default async function ReportsPage() {
  const summary = await getReportsOverview();

  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Reporting"
        title="Reportes"
        description="Exporta reportes claros para compartir avances, riesgos y prioridades sin salir del workspace."
        icon={<BarChart3 className="h-5 w-5" />}
        actions={
          <>
            <Link href="/app/reports/print?type=summary" target="_blank"><Button variant="secondary">Resumen PDF</Button></Link>
            <Link href="/app/reports/print?type=operations" target="_blank"><Button>Operación PDF</Button></Link>
            <Link href="/app/reports/print?type=executive" target="_blank"><Button variant="secondary">Ejecutivo PDF</Button></Link>
            <Link href="/app/reports/print?type=planning" target="_blank"><Button variant="secondary">Planning PDF</Button></Link>
            <Link href="/app/reports/print?type=control" target="_blank"><Button variant="secondary">Control PDF</Button></Link>
            <Link href="/app/reports/print?type=risk" target="_blank"><Button variant="secondary">Risk PDF</Button></Link>
            <Link href="/app/reports/print?type=intelligence" target="_blank"><Button variant="secondary">Intelligence PDF</Button></Link>
            <Link href="/app/reports/print?type=execution" target="_blank"><Button variant="secondary">Execution PDF</Button></Link>
            <Link href="/app/reports/print?type=os" target="_blank"><Button variant="secondary">Workspace OS PDF</Button></Link>
            <Link href="/app/reports/print?type=executive-suite" target="_blank"><Button variant="secondary">Executive PDF</Button></Link>
          </>
        }
      />

      <OperationsOverview summary={summary} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Descarga para hojas de cálculo</h2>
          <p className="mt-2 text-sm text-slate-600">Baja tus listas de tareas y proyectos para compartirlas o seguirlas en Excel y Google Sheets.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/api/export/tasks"><Button>Tareas CSV</Button></Link>
            <Link href="/api/export/projects"><Button variant="secondary">Proyectos CSV</Button></Link>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Checklist semanal</h2>
          <div className="mt-3 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">1. Revisa lo urgente y mueve primero las tareas vencidas.</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">2. Exporta el PDF que mejor encaje con tu reunión o seguimiento.</div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">3. Comparte riesgos y próximos pasos con clientes o con tu equipo.</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
