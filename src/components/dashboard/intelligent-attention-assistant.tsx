"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, BellOff, CalendarClock, CheckCircle2, ChevronDown, ChevronUp, Clock3, PauseCircle, ShieldAlert, Sparkles, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { asRoute, taskDetailRoute, taskListRoute, type AppRoute } from "@/lib/navigation/routes";
import {
  DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS,
  INTELLIGENT_ASSISTANT_SETTINGS_KEY,
  normalizeIntelligentAssistantSettings,
  type IntelligentAssistantSettings,
} from "@/lib/assistant/reminder-settings";

type AssistantTask = {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  client_name?: string | null;
  project_id?: string | null;
};

type Props = {
  workspaceKey: string;
  workspaceLabel?: string;
  location?: "dashboard" | "organization";
  signals: {
    overdue: AssistantTask[];
    dueToday: AssistantTask[];
    dueSoon: AssistantTask[];
    waitingReview: AssistantTask[];
  };
  notificationsEnabled?: boolean;
};

type AssistantMood = "critical" | "attention" | "calm";

type AssistantCard = {
  id: string;
  mood: AssistantMood;
  title: string;
  body: string;
  ctaLabel: string;
  href: AppRoute;
  items: AssistantTask[];
  icon: typeof AlertTriangle;
};

function readSettings() {
  if (typeof window === "undefined") return DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(INTELLIGENT_ASSISTANT_SETTINGS_KEY);
    if (!raw) return DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS;
    return normalizeIntelligentAssistantSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS;
  }
}

function formatDueLabel(date: string | null) {
  if (!date) return "Sin fecha límite";
  const value = new Date(`${date}T00:00:00`);
  return value.toLocaleDateString("es-CR", { day: "2-digit", month: "short" });
}

function buildCards(signals: Props["signals"]): AssistantCard[] {
  const cards: AssistantCard[] = [];

  if (signals.overdue.length) {
    cards.push({
      id: "overdue",
      mood: "critical",
      title: signals.overdue.length === 1 ? "Hay una tarea vencida que conviene atender primero" : `Tienes ${signals.overdue.length} tareas vencidas que ya requieren atención`,
      body: "Empieza por lo atrasado para proteger entregas, dar contexto al equipo y evitar que el resto del tablero se contamine.",
      ctaLabel: "Revisar vencidas",
      href: taskListRoute("due=overdue&view=list"),
      items: signals.overdue,
      icon: ShieldAlert,
    });
  }

  if (signals.dueToday.length) {
    cards.push({
      id: "today",
      mood: "attention",
      title: signals.dueToday.length === 1 ? "Hoy hay una entrega que merece seguimiento" : `Hoy tienes ${signals.dueToday.length} entregas que conviene cerrar`,
      body: "Revísalas ahora para decidir si necesitan seguimiento, reasignación o una actualización rápida antes del cierre del día.",
      ctaLabel: "Ver entregas de hoy",
      href: taskListRoute("due=today&view=list"),
      items: signals.dueToday,
      icon: CalendarClock,
    });
  }

  if (signals.waitingReview.length) {
    cards.push({
      id: "waiting",
      mood: "attention",
      title: signals.waitingReview.length === 1 ? "Hay un frente en espera que pide revisión" : `Hay ${signals.waitingReview.length} frentes en espera que merecen una mirada`,
      body: "Este tipo de trabajo suele quedarse estancado si nadie retoma la conversación. Una revisión corta puede destrabarlo.",
      ctaLabel: "Abrir en espera",
      href: taskListRoute("status=en_espera&view=list"),
      items: signals.waitingReview,
      icon: PauseCircle,
    });
  }

  if (signals.dueSoon.length) {
    cards.push({
      id: "soon",
      mood: "calm",
      title: signals.dueSoon.length === 1 ? "Tienes una entrega cercana para anticiparte" : `Tienes ${signals.dueSoon.length} tareas próximas y todavía estás a tiempo`,
      body: "Un repaso rápido hoy te ayuda a llegar con menos presión y evita recordatorios más ruidosos después.",
      ctaLabel: "Planificar próximas",
      href: taskListRoute("due=soon&view=list"),
      items: signals.dueSoon,
      icon: Clock3,
    });
  }

  if (!cards.length) {
    cards.push({
      id: "clear",
      mood: "calm",
      title: "Todo se ve bajo control por ahora",
      body: "No detectamos nada fuera de tiempo ni una entrega que te pida correr. Puedes entrar directo a foco o revisar la pizarra con calma.",
      ctaLabel: "Abrir pizarra",
      href: asRoute("/app/board"),
      items: [],
      icon: CheckCircle2,
    });
  }

  return cards;
}

const moodStyles: Record<AssistantMood, string> = {
  critical: "border-rose-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,241,242,0.96))]",
  attention: "border-amber-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,251,235,0.96))]",
  calm: "border-emerald-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(236,253,245,0.96))]",
};

export function IntelligentAttentionAssistant({ workspaceKey, workspaceLabel = "tu workspace", location = "dashboard", signals, notificationsEnabled = true }: Props) {
  const [settings, setSettings] = useState<IntelligentAssistantSettings>(DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setSettings(readSettings());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const onStorage = () => setSettings(readSettings());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [hydrated]);

  const cards = useMemo(() => buildCards(signals), [signals]);
  const filteredCards = useMemo(() => {
    if (settings.sensitivity === "critical") return cards.filter((item) => item.mood === "critical");
    if (settings.sensitivity === "focus") return cards.filter((item) => item.mood !== "calm");
    return cards;
  }, [cards, settings.sensitivity]);

  const activeCard = filteredCards[0] ?? cards[0];

  useEffect(() => {
    if (!hydrated || !activeCard) return;
    if (!notificationsEnabled || !settings.enabled) {
      setVisible(false);
      return;
    }

    const snoozeKey = `flowtask:intelligent-assistant:snooze:${workspaceKey}`;
    const dismissedKey = `flowtask:intelligent-assistant:dismissed:${workspaceKey}:${activeCard.id}`;
    const now = Date.now();
    const snoozedUntil = Number(window.localStorage.getItem(snoozeKey) ?? 0);
    const dismissedAt = Number(window.sessionStorage.getItem(dismissedKey) ?? 0);
    const cadenceWindow = settings.cadenceMinutes * 60 * 1000;

    if (snoozedUntil && snoozedUntil > now) {
      setVisible(false);
      return;
    }

    if (dismissedAt && now - dismissedAt < cadenceWindow) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), 180);
    return () => window.clearTimeout(timer);
  }, [hydrated, activeCard, workspaceKey, settings, notificationsEnabled]);

  if (!activeCard || !hydrated || !settings.enabled || !notificationsEnabled || !visible) return null;
  if (settings.showOnDashboardOnly && location !== "dashboard") return null;

  const Icon = activeCard.icon;
  const mascotSrc = activeCard.mood === "critical" || activeCard.mood === "attention" ? "/assistant/guide-male.png" : "/assistant/guide-female.png";

  const dismissForNow = () => {
    window.sessionStorage.setItem(`flowtask:intelligent-assistant:dismissed:${workspaceKey}:${activeCard.id}`, String(Date.now()));
    setVisible(false);
  };

  const snooze = (minutes: number) => {
    window.localStorage.setItem(`flowtask:intelligent-assistant:snooze:${workspaceKey}`, String(Date.now() + minutes * 60 * 1000));
    setVisible(false);
  };

  return (
    <Card
      className={[
        "relative overflow-hidden rounded-[28px] border p-0 shadow-[0_18px_38px_rgba(15,23,42,0.08)] transition-all duration-500",
        moodStyles[activeCard.mood],
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      ].join(" ")}
    >
      <div className="grid gap-0 lg:grid-cols-[240px_minmax(0,1fr)]">
        {settings.showMascot ? (
          <div className="relative hidden min-h-[250px] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.92),rgba(248,250,252,0.72))] lg:block">
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/80 to-transparent" />
            <Image
              src={mascotSrc}
              alt="Asistente de FlowTask"
              fill
              sizes="240px"
              className="object-contain object-bottom px-4 pt-4"
              priority
            />
          </div>
        ) : null}

        <div className="relative px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
          <div className="flex items-start justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Atención inteligente · {workspaceLabel}
            </div>
            <button
              type="button"
              onClick={dismissForNow}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
              aria-label="Ocultar recordatorio"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/85 text-slate-800 shadow-sm">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-[1.7rem] font-semibold tracking-tight text-slate-950">{activeCard.title}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{activeCard.body}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={activeCard.href} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900">
                  {activeCard.ctaLabel}
                </Link>
                <Button type="button" variant="secondary" className="rounded-full" onClick={() => snooze(30)}>
                  Ver luego
                </Button>
                <Button type="button" variant="secondary" className="rounded-full" onClick={() => setExpanded((value) => !value)}>
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {expanded ? "Ocultar detalle" : "Ver detalle"}
                </Button>
              </div>
            </div>

            <div className="rounded-[22px] border border-white/70 bg-white/72 px-4 py-3 text-sm text-slate-600 shadow-sm lg:w-[260px]">
              <p className="font-semibold text-slate-900">Nivel de ruido actual</p>
              <p className="mt-1 leading-6">
                {settings.sensitivity === "critical"
                  ? "Solo verás alertas realmente urgentes."
                  : settings.sensitivity === "focus"
                    ? "Estás viendo lo urgente y lo que conviene revisar pronto."
                    : "Verás un radar más completo con contexto preventivo."}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                <BellOff className="h-3.5 w-3.5" />
                Ventana de descanso: {settings.cadenceMinutes} min
              </div>
            </div>
          </div>

          {expanded ? (
            <div className="mt-5 rounded-[24px] border border-white/70 bg-white/70 p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">Qué mirar primero</p>
                <span className="text-xs font-medium text-slate-500">{activeCard.items.length} elemento(s)</span>
              </div>
              <div className="mt-3 grid gap-2.5 lg:grid-cols-2">
                {activeCard.items.length ? activeCard.items.map((item) => (
                  <Link
                    key={item.id}
                    href={taskDetailRoute(item.id)}
                    className="rounded-[18px] border border-slate-200/80 bg-white px-3 py-3 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_12px_22px_rgba(15,23,42,0.06)]"
                  >
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">{item.title}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-200">{item.client_name || "Sin cliente"}</span>
                      <span className="rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-200">{formatDueLabel(item.due_date)}</span>
                    </div>
                  </Link>
                )) : (
                  <div className="rounded-[18px] border border-slate-200/80 bg-white px-3 py-4 text-sm text-slate-600 lg:col-span-2">
                    Todo está bajo control. Usa este espacio como recordatorio suave cuando quieras revisar antes de que algo se vuelva urgente.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
