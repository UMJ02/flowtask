import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
        <p className="mt-2 text-sm text-slate-500">
          Exporta información para jefatura, seguimiento y cierres semanales.
        </p>
      </Card>

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
          <h2 className="text-lg font-semibold text-slate-900">Vista lista para PDF</h2>
          <p className="mt-2 text-sm text-slate-600">Abre una vista imprimible y guarda como PDF desde el navegador.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/app/reports/print?type=summary" target="_blank"><Button>Resumen PDF</Button></Link>
            <Link href="/app/reports/print?type=projects" target="_blank"><Button variant="secondary">Proyectos PDF</Button></Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
