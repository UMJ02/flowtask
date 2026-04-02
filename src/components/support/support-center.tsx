"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type RecentTicket = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  source: string;
  createdAtLabel: string;
};

type RecentError = {
  id: string;
  level: string;
  source: string;
  route: string;
  message: string;
  createdAtLabel: string;
};

type UsageSummary = {
  loginEvents: number;
  projectEvents: number;
  taskEvents: number;
  supportEvents: number;
};

export function SupportCenter({
  organizationId,
  usage,
  tickets,
  errors,
}: {
  organizationId?: string | null;
  usage: UsageSummary;
  tickets: RecentTicket[];
  errors: RecentError[];
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitTicket = async () => {
    setFeedback(null);
    if (!subject.trim() || !message.trim()) {
      setFeedback("Completa el asunto y la descripción del problema.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: organizationId ?? null,
          subject,
          message,
          priority,
          source: "in_app",
          route: typeof window !== "undefined" ? window.location.pathname : "/app/support",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setFeedback("No se pudo crear el ticket de soporte.");
        return;
      }

      setSubject("");
      setMessage("");
      setPriority("normal");
      setFeedback("Ticket enviado. Ya quedó registrado en la mesa interna.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Post-release ops</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Observabilidad y soporte</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Registra incidencias reales, sigue la actividad clave del workspace y mantén soporte operativo sin salir de la plataforma.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-300">Telemetría reciente</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Metric label="Login" value={usage.loginEvents} />
              <Metric label="Proyectos" value={usage.projectEvents} />
              <Metric label="Tareas" value={usage.taskEvents} />
              <Metric label="Soporte" value={usage.supportEvents} />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Reportar problema</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Crea un ticket de soporte</h2>
          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Asunto</label>
              <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Ej. No carga el detalle del proyecto" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Prioridad</label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option value="low">Baja</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Descripción</label>
              <Textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Describe el problema, qué esperabas y qué ocurrió."
              />
            </div>
            {feedback ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{feedback}</div>
            ) : null}
            <Button type="button" onClick={submitTicket} loading={isSubmitting}>
              {isSubmitting ? "Enviando…" : "Enviar ticket"}
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tus tickets</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Seguimiento reciente</h2>
            <div className="mt-4 space-y-3">
              {tickets.length ? tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">{ticket.status.replaceAll("_", " ")}</span>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">{ticket.priority}</span>
                  </div>
                  <p className="mt-3 font-semibold text-slate-900">{ticket.subject}</p>
                  <p className="mt-2 text-xs text-slate-500">Creado: {ticket.createdAtLabel}</p>
                </div>
              )) : <Empty label="No has creado tickets recientes." />}
            </div>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Errores registrados</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Bitácora reciente</h2>
            <div className="mt-4 space-y-3">
              {errors.length ? errors.map((error) => (
                <div key={error.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-700">{error.level}</span>
                    <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-700">{error.source}</span>
                  </div>
                  <p className="mt-3 font-semibold text-slate-900">{error.message}</p>
                  <p className="mt-1 text-sm text-slate-600">{error.route}</p>
                  <p className="mt-2 text-xs text-slate-500">Registrado: {error.createdAtLabel}</p>
                </div>
              )) : <Empty label="No hay errores recientes para esta organización." />}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">{label}</div>;
}
