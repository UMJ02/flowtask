import { AlertTriangle, CheckCircle2, Clock3, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";

type DeliverySummary = {
  total: number;
  sent: number;
  failed: number;
  pending: number;
};

type DigestPreview = {
  digest_date?: string | null;
  status?: string | null;
  total_notifications?: number | null;
  summary_title?: string | null;
  summary_body?: string | null;
  processed_at?: string | null;
} | null;

export function NotificationDeliveryHealth({
  deliverySummary,
  digestPreview,
}: {
  deliverySummary: DeliverySummary;
  digestPreview: DigestPreview;
}) {
  const successRate = deliverySummary.total ? Math.round((deliverySummary.sent / deliverySummary.total) * 100) : 0;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <div className="flex items-start gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Inbox className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Salud de entregas</h2>
            <p className="mt-1 text-sm text-slate-500">Mide si tus avisos están saliendo como deben y detecta rápido si hay algo que revisar.</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Total</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{deliverySummary.total}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Enviadas</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{deliverySummary.sent}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Pendientes</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{deliverySummary.pending}</p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">Fallidas</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{deliverySummary.failed}</p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Lectura rápida</p>
          <p className="mt-1 text-sm text-slate-600">
            {deliverySummary.total
              ? `Tu tasa de salida efectiva ronda el ${successRate}%. ${deliverySummary.failed ? "Hay entregas fallidas que conviene revisar." : "No hay fallos recientes registrados."}`
              : "Todavía no hay entregas externas para medir. La app está lista para empezar a generar ese historial."}
          </p>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Resumen diario más reciente</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Estado</p>
              <p className="mt-1 text-sm text-slate-600">{digestPreview?.status ? `Último digest en estado ${digestPreview.status}.` : "Todavía no hay un digest generado para este usuario."}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Clock3 className="mt-0.5 h-4 w-4 text-slate-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Cobertura</p>
              <p className="mt-1 text-sm text-slate-600">{digestPreview?.total_notifications ? `${digestPreview.total_notifications} notificaciones consideradas en el resumen más reciente.` : "Aún no hay una muestra de resumen suficiente para evaluar cobertura."}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Acción sugerida</p>
              <p className="mt-1 text-sm text-slate-600">
                {deliverySummary.failed
                  ? "Revisa primero los fallos por canal para no perder avisos importantes antes de ampliar automatizaciones."
                  : "La base está sana para seguir activando más automatizaciones y canales externos cuando quieras."}
              </p>
            </div>
          </div>
          {digestPreview?.summary_title ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Vista previa</p>
              <p className="mt-2 text-sm font-medium text-slate-800">{digestPreview.summary_title}</p>
              {digestPreview.summary_body ? <p className="mt-1 text-sm text-slate-600">{digestPreview.summary_body}</p> : null}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
