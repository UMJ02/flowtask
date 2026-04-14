"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  PauseCircle,
  Sparkles,
  X,
  BellOff,
  LayoutGrid,
  TimerReset,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { asRoute, taskListRoute, type AppRoute } from "@/lib/navigation/routes";
import {
  DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS,
  INTELLIGENT_ASSISTANT_SETTINGS_KEY,
  normalizeIntelligentAssistantSettings,
  type IntelligentAssistantSettings,
  type IntelligentAssistantRuleKey,
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
    stale: AssistantTask[];
    noDueDate: AssistantTask[];
  };
  notificationsEnabled?: boolean;
};

type AssistantMood = "critical" | "attention" | "calm";

type AssistantCard = {
  id: IntelligentAssistantRuleKey | "clear";
  mood: AssistantMood;
  title: string;
  shortBody: string;
  ctaLabel: string;
  href: AppRoute;
  items: AssistantTask[];
  icon: typeof AlertTriangle;
  score: number;
  badge: string;
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
  if (!date) return "Sin fecha";
  const value = new Date(`${date}T00:00:00`);
  return value.toLocaleDateString("es-CR", { day: "2-digit", month: "short" });
}

function buildCards(signals: Props["signals"]): AssistantCard[] {
  const cards: AssistantCard[] = [];
  if (signals.overdue.length) {
    cards.push({
      id: "overdue",
      mood: "critical",
      title: signals.overdue.length === 1 ? "Una tarea ya se pasó de fecha" : `${signals.overdue.length} tareas ya van tarde`,
      shortBody: "Lo más urgente para cortar arrastres.",
      ctaLabel: "Ver vencidas",
      href: taskListRoute("due=overdue&view=list"),
      items: signals.overdue,
      icon: AlertTriangle,
      score: 100 + signals.overdue.length * 12,
      badge: "Urgente",
    });
  }
  if (signals.dueToday.length) {
    cards.push({
      id: "dueToday",
      mood: "attention",
      title: signals.dueToday.length === 1 ? "Hoy tienes una entrega clave" : `Hoy cierras ${signals.dueToday.length} entregas`,
      shortBody: "Conviene revisarlas antes de que cierre el día.",
      ctaLabel: "Ver hoy",
      href: taskListRoute("due=today&view=list"),
      items: signals.dueToday,
      icon: CalendarClock,
      score: 82 + signals.dueToday.length * 8,
      badge: "Hoy",
    });
  }
  if (signals.stale.length) {
    cards.push({
      id: "stale",
      mood: "attention",
      title: signals.stale.length === 1 ? "Hay una tarea sin movimiento" : `${signals.stale.length} tareas llevan días quietas`,
      shortBody: "Buen momento para destrabarlas o cerrarlas.",
      ctaLabel: "Revisar quietas",
      href: taskListRoute("view=list"),
      items: signals.stale,
      icon: TimerReset,
      score: 72 + signals.stale.length * 6,
      badge: "Seguimiento",
    });
  }
  if (signals.waitingReview.length) {
    cards.push({
      id: "waitingReview",
      mood: "attention",
      title: signals.waitingReview.length === 1 ? "Hay algo en espera" : `${signals.waitingReview.length} frentes siguen en espera`,
      shortBody: "Una revisión corta puede reactivar el flujo.",
      ctaLabel: "Abrir en espera",
      href: taskListRoute("status=en_espera&view=list"),
      items: signals.waitingReview,
      icon: PauseCircle,
      score: 64 + signals.waitingReview.length * 5,
      badge: "En espera",
    });
  }
  if (signals.dueSoon.length) {
    cards.push({
      id: "dueSoon",
      mood: "calm",
      title: signals.dueSoon.length === 1 ? "Se acerca una entrega" : `${signals.dueSoon.length} tareas vienen en camino`,
      shortBody: "Todavía estás a tiempo de adelantarte.",
      ctaLabel: "Planificar",
      href: taskListRoute("due=soon&view=list"),
      items: signals.dueSoon,
      icon: Clock3,
      score: 48 + signals.dueSoon.length * 4,
      badge: "Próximo",
    });
  }
  if (signals.noDueDate.length) {
    cards.push({
      id: "noDueDate",
      mood: "calm",
      title: signals.noDueDate.length === 1 ? "Tienes una tarea sin fecha" : `${signals.noDueDate.length} tareas siguen sin fecha`,
      shortBody: "Poner fecha reduce dudas y mejora prioridad.",
      ctaLabel: "Ver sin fecha",
      href: taskListRoute("view=list"),
      items: signals.noDueDate,
      icon: LayoutGrid,
      score: 30 + signals.noDueDate.length * 3,
      badge: "Orden",
    });
  }
  if (!cards.length) {
    cards.push({
      id: "clear",
      mood: "calm",
      title: "Todo se ve bajo control",
      shortBody: "No hay nada crítico pidiendo atención ahora mismo.",
      ctaLabel: "Abrir tablero",
      href: asRoute("/app/board"),
      items: [],
      icon: CheckCircle2,
      score: 10,
      badge: "En orden",
    });
  }
  return cards.sort((a,b)=>b.score-a.score);
}

const moodStyles: Record<AssistantMood, string> = {
  critical: "border-rose-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,241,242,0.92))]",
  attention: "border-amber-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,251,235,0.94))]",
  calm: "border-emerald-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(236,253,245,0.92))]",
};

const ruleMap: Record<IntelligentAssistantRuleKey, keyof Props["signals"]> = {
  overdue: "overdue",
  dueToday: "dueToday",
  dueSoon: "dueSoon",
  waitingReview: "waitingReview",
  stale: "stale",
  noDueDate: "noDueDate",
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
    let next = cards.filter((card) => card.id === 'clear' || settings.rules[card.id as IntelligentAssistantRuleKey] !== false);
    if (settings.sensitivity === "critical") next = next.filter((item) => item.mood === "critical" || item.id === 'clear');
    if (settings.sensitivity === "focus") next = next.filter((item) => item.mood !== "calm" || item.id === 'clear');
    if (settings.sensitivity === "balanced") next = next.slice(0, 2);
    return next.slice(0, settings.maxCards);
  }, [cards, settings]);

  const activeCard = filteredCards[0] ?? cards[0];

  useEffect(() => {
    if (!hydrated || !activeCard) return;
    if (!notificationsEnabled || !settings.enabled) {
      setVisible(false);
      return;
    }
    const snoozeKey = `flowtask:intelligent-assistant:snooze:${settings.workspaceAware ? workspaceKey : 'global'}`;
    const dismissedKey = `flowtask:intelligent-assistant:dismissed:${settings.workspaceAware ? workspaceKey : 'global'}:${activeCard.id}`;
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
    const timer = window.setTimeout(() => setVisible(true), 160);
    return () => window.clearTimeout(timer);
  }, [hydrated, activeCard, workspaceKey, settings, notificationsEnabled]);

  if (!activeCard || !hydrated || !settings.enabled || !notificationsEnabled || !visible) return null;
  if (settings.showOnDashboardOnly && location !== "dashboard") return null;

  const Icon = activeCard.icon;
  const mascotSrc = activeCard.mood === "critical" || activeCard.mood === "attention" ? "/assistant/guide-male.png" : "/assistant/guide-female.png";

  const dismissForNow = () => {
    const keyWorkspace = settings.workspaceAware ? workspaceKey : 'global';
    window.sessionStorage.setItem(`flowtask:intelligent-assistant:dismissed:${keyWorkspace}:${activeCard.id}`, String(Date.now()));
    setVisible(false);
  };

  const snooze = (minutes: number) => {
    const keyWorkspace = settings.workspaceAware ? workspaceKey : 'global';
    window.localStorage.setItem(`flowtask:intelligent-assistant:snooze:${keyWorkspace}`, String(Date.now() + minutes * 60 * 1000));
    setVisible(false);
  };

  return (
    <Card className={["relative overflow-hidden rounded-[28px] border p-0 shadow-[0_18px_38px_rgba(15,23,42,0.08)] transition-all duration-500", moodStyles[activeCard.mood], visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"].join(" ")}>
      <div className="grid gap-0 lg:grid-cols-[220px_minmax(0,1fr)]">
        {settings.showMascot ? (
          <div className="relative hidden min-h-[220px] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.92),rgba(248,250,252,0.72))] lg:block">
            <Image src={mascotSrc} alt="Asistente de FlowTask" fill sizes="220px" className="object-contain object-bottom px-4 pt-4" priority />
          </div>
        ) : null}

        <div className="relative px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
          <div className="flex items-start justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Enfoque inteligente · {workspaceLabel}
            </div>
            <button type="button" onClick={dismissForNow} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-500 transition hover:border-slate-300 hover:text-slate-700" aria-label="Ocultar recordatorio">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                  <Icon className="h-3.5 w-3.5" />
                  {activeCard.badge}
                </span>
                <span className="inline-flex rounded-full border border-white/80 bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {activeCard.score} pts
                </span>
              </div>
              <h3 className="mt-3 max-w-3xl text-[1.35rem] font-semibold tracking-tight text-slate-950 sm:text-[1.55rem]">{activeCard.title}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{activeCard.shortBody}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <Link href={activeCard.href} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-900">
                  {activeCard.ctaLabel}
                </Link>
                <Button type="button" variant="secondary" className="rounded-full" onClick={() => snooze(settings.cadenceMinutes)}>
                  <BellOff className="h-4 w-4" />
                  Pausar {settings.cadenceMinutes} min
                </Button>
                <button type="button" onClick={() => setExpanded((value) => !value)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white">
                  Ver detalle
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="min-w-[160px] rounded-[22px] border border-white/75 bg-white/72 p-3 text-sm text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Motor activo</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {settings.sensitivity === "critical" ? "Solo lo urgente" : settings.sensitivity === "focus" ? "Foco diario" : settings.sensitivity === "balanced" ? "Panorama limpio" : "Modo adaptativo"}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Ventana de descanso: {settings.cadenceMinutes} min</p>
              <p className="mt-3 text-xs leading-5 text-slate-500">{settings.workspaceAware ? "Cada workspace recuerda su propio estado." : "El asistente usa una sola memoria global."}</p>
            </div>
          </div>

          {expanded ? (
            <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
              <div className="rounded-[24px] border border-slate-200/80 bg-white/82 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">Qué mirar primero</p>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{activeCard.items.length} items</span>
                </div>
                <div className="mt-3 space-y-2.5">
                  {activeCard.items.length ? activeCard.items.map((item) => (
                    <Link key={item.id} href={asRoute(`/app/tasks/${item.id}`)} className="group flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-white px-3 py-3 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_22px_rgba(15,23,42,0.05)]">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.client_name || "Sin cliente"} · {formatDueLabel(item.due_date)}</p>
                      </div>
                      <ChevronDown className="h-4 w-4 rotate-[-90deg] text-slate-400 transition group-hover:text-slate-600" />
                    </Link>
                  )) : <p className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">No hay elementos puntuales que listar ahora.</p>}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200/80 bg-white/82 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm font-semibold text-slate-900">Resumen del workspace</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  {filteredCards.map((card) => (
                    <div key={card.id} className="rounded-[18px] border border-slate-200 bg-white px-3 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900">{card.title}</p>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{card.items.length}</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{card.shortBody}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
