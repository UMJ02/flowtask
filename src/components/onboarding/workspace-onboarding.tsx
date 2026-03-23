import Link from "next/link";
import { ArrowRight, CheckCircle2, Rocket, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { WorkspaceOnboardingSummary } from "@/lib/queries/onboarding";

const categoryStyles: Record<WorkspaceOnboardingSummary["steps"][number]["category"], string> = {
  foundation: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  operation: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  automation: "bg-violet-50 text-violet-700 ring-1 ring-violet-100",
};

const categoryLabels: Record<WorkspaceOnboardingSummary["steps"][number]["category"], string> = {
  foundation: "Base",
  operation: "Operación",
  automation: "Automatización",
};

function progressTone(score: number) {
  if (score >= 85) return "from-emerald-500 to-teal-400";
  if (score >= 60) return "from-amber-500 to-orange-400";
  return "from-slate-700 to-slate-500";
}

export function WorkspaceOnboarding({ summary, compact = false }: { summary: WorkspaceOnboardingSummary; compact?: boolean }) {
  const pending = summary.steps.filter((step) => !step.done);

  if (compact) {
    return (
      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <Rocket className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Onboarding</p>
              <h3 className="mt-1 text-xl font-bold text-slate-900">Workspace readiness: {summary.score}%</h3>
              <p className="mt-1 text-sm text-slate-500">
                {summary.completed} de {summary.total} bloques cerrados en {summary.organizationName}.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {pending[0] ? (
              <Link href={pending[0].href}>
                <Button>Continuar setup</Button>
              </Link>
            ) : null}
            <Link href="/app/onboarding">
              <Button variant="secondary">Abrir centro de arranque</Button>
            </Link>
          </div>
        </div>
        <div className="mt-5 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-3 rounded-full bg-gradient-to-r ${progressTone(summary.score)}`} style={{ width: `${summary.score}%` }} />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[linear-gradient(135deg,#06291d_0%,#0f172a_58%,#111827_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.25)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Workspace onboarding</p>
            <h2 className="mt-2 text-3xl font-bold">Centro de arranque y cierre operativo</h2>
            <p className="mt-2 text-sm text-slate-300">
              Usa esta vista para convertir el workspace en una base lista para escalar, con organización, operación y automatización cerradas.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Readiness</p>
              <p className="mt-2 text-3xl font-bold">{summary.score}%</p>
              <p className="mt-1 text-sm text-slate-300">Nivel de cierre del workspace.</p>
            </div>
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Organización</p>
              <p className="mt-2 text-lg font-bold">{summary.organizationName}</p>
              <p className="mt-1 text-sm text-slate-300">Rol actual: {summary.role}</p>
            </div>
            <div className="rounded-[26px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Bloques cerrados</p>
              <p className="mt-2 text-3xl font-bold">{summary.completed}/{summary.total}</p>
              <p className="mt-1 text-sm text-slate-300">Pasos completados hasta ahora.</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Checklist maestro</h3>
              <p className="mt-1 text-sm text-slate-500">Cada bloque está pensado para cerrar base, operación y automatización sin improvisar.</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
              <ShieldCheck className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {summary.steps.map((step) => (
              <div key={step.id} className="rounded-[26px] border border-slate-200 bg-white px-4 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full ${step.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                        <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${categoryStyles[step.category]}`}>
                          {categoryLabels[step.category]}
                        </span>
                        {step.done ? <span className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-600">Listo</span> : null}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{step.description}</p>
                    </div>
                  </div>
                  <Link href={step.href}>
                    <Button variant={step.done ? "secondary" : "primary"}>{step.cta}</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Pulso del workspace</h3>
                <p className="mt-1 text-sm text-slate-500">Indicadores básicos para saber si ya existe señal operativa.</p>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <UsersRound className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Miembros</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{summary.quickStats.members}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Clientes</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{summary.quickStats.clients}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Proyectos activos</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{summary.quickStats.activeProjects}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Tareas abiertas</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{summary.quickStats.openTasks}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Próximo movimiento recomendado</h3>
                <p className="mt-1 text-sm text-slate-500">Lo más rentable para cerrar el setup sin perder tiempo.</p>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
                <Sparkles className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {summary.recommendations.length ? summary.recommendations.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {item}
                </div>
              )) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
                  El workspace ya tiene una base sólida. Desde aquí conviene escalar automatizaciones, reportes o colaboración avanzada.
                </div>
              )}
            </div>
            <div className="mt-5 grid gap-3">
              <Link href="/app/settings">
                <Button className="w-full justify-between">Ajustar automatizaciones <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link href="/app/reports">
                <Button variant="secondary" className="w-full justify-between">Revisar reportes <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
