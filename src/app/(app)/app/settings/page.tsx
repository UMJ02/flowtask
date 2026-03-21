import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="mt-2 text-sm text-slate-500">
          Administra personalización del tablero, notificaciones, enlaces compartidos y permisos por proyecto.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Permisos por proyecto</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Owner</p>
            <p className="mt-1 text-sm text-slate-600">Control total del proyecto, miembros, estado y enlaces compartidos.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Editor</p>
            <p className="mt-1 text-sm text-slate-600">Puede actualizar estado, tareas y seguimiento del proyecto.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Viewer</p>
            <p className="mt-1 text-sm text-slate-600">Solo lectura para consulta, revisión y jefatura interna.</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Reportes y exportación</h2>
        <p className="mt-2 text-sm text-slate-600">
          Usa el módulo de reportes para exportar tareas y proyectos en CSV o abrir una vista lista para imprimir en PDF desde el navegador.
        </p>
      </Card>
    </div>
  );
}
