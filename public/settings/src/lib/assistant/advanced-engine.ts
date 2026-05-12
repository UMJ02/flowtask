import { asRoute, taskListRoute, type AppRoute } from "@/lib/navigation/routes";
import type { IntelligentAssistantSettings } from "@/lib/assistant/reminder-settings";
import { AlertTriangle, CalendarClock, CheckCircle2, Clock3, PauseCircle, ShieldAlert, Sparkles } from "lucide-react";

export type AssistantTask = {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  client_name?: string | null;
  project_id?: string | null;
};

export type AssistantSignals = {
  overdue: AssistantTask[];
  dueToday: AssistantTask[];
  dueSoon: AssistantTask[];
  waitingReview: AssistantTask[];
};

export type AssistantMood = "critical" | "attention" | "calm";

export type AssistantCard = {
  id: string;
  mood: AssistantMood;
  title: string;
  body: string;
  ctaLabel: string;
  href: AppRoute;
  items: AssistantTask[];
  icon: typeof AlertTriangle;
  score: number;
  toneLabel: string;
  compactHint: string;
};

function concise(text: string, minimal: boolean, fallback: string) {
  return minimal ? fallback : text;
}

export function buildAssistantCards(signals: AssistantSignals, settings: IntelligentAssistantSettings): AssistantCard[] {
  const cards: AssistantCard[] = [];
  const minimal = settings.verbosity === "minimal";

  if (settings.alertTypes.overdue && signals.overdue.length) {
    const score = 120 + signals.overdue.length * 18 + Math.min(signals.dueToday.length, 4) * 8;
    cards.push({
      id: "overdue",
      mood: "critical",
      title: signals.overdue.length === 1 ? "Hay una tarea vencida que conviene resolver primero" : `Hay ${signals.overdue.length} tareas vencidas empujando el día`,
      body: concise(
        "Empieza por lo atrasado para despejar presión, evitar arrastre operativo y recuperar claridad en el tablero.",
        minimal,
        "Conviene limpiar primero lo que ya está vencido.",
      ),
      ctaLabel: "Revisar vencidas",
      href: taskListRoute("due=overdue&view=list"),
      items: signals.overdue,
      icon: ShieldAlert,
      score,
      toneLabel: "Prioridad alta",
      compactHint: "Lo vencido está contaminando tu foco.",
    });
  }

  if (settings.alertTypes.dueToday && signals.dueToday.length) {
    const score = 92 + signals.dueToday.length * 14 + Math.min(signals.overdue.length, 3) * 10;
    cards.push({
      id: "today",
      mood: signals.overdue.length ? "critical" : "attention",
      title: signals.dueToday.length === 1 ? "Hoy hay una entrega que merece seguimiento" : `Hoy tienes ${signals.dueToday.length} entregas sensibles`,
      body: concise(
        "Haz una revisión corta para decidir si necesitan seguimiento, reasignación o una actualización rápida antes del cierre.",
        minimal,
        "Revisa lo que cierra hoy antes de que te gane el día.",
      ),
      ctaLabel: "Ver hoy",
      href: taskListRoute("due=today&view=list"),
      items: signals.dueToday,
      icon: CalendarClock,
      score,
      toneLabel: "Seguimiento hoy",
      compactHint: "Hoy conviene confirmar cierres y bloqueos.",
    });
  }

  if (settings.alertTypes.waitingReview && signals.waitingReview.length) {
    const score = 74 + signals.waitingReview.length * 12 + Math.min(signals.dueSoon.length, 4) * 4;
    cards.push({
      id: "waiting",
      mood: "attention",
      title: signals.waitingReview.length === 1 ? "Hay un frente detenido esperando revisión" : `Hay ${signals.waitingReview.length} frentes en pausa que merecen una mirada`,
      body: concise(
        "Este tipo de trabajo suele quedarse estancado si nadie retoma la conversación. Una revisión corta puede destrabarlo.",
        minimal,
        "Una revisión breve puede volver a mover este frente.",
      ),
      ctaLabel: "Abrir en espera",
      href: taskListRoute("status=en_espera&view=list"),
      items: signals.waitingReview,
      icon: PauseCircle,
      score,
      toneLabel: "Pide revisión",
      compactHint: "Hay trabajo quieto que puede destrabarse rápido.",
    });
  }

  if (settings.alertTypes.dueSoon && signals.dueSoon.length) {
    const score = 58 + signals.dueSoon.length * 8;
    cards.push({
      id: "soon",
      mood: signals.dueSoon.length >= 4 ? "attention" : "calm",
      title: signals.dueSoon.length === 1 ? "Tienes una entrega próxima para anticiparte" : `Tienes ${signals.dueSoon.length} tareas cercanas para ordenar con calma`,
      body: concise(
        "Un repaso rápido hoy te ayuda a llegar con menos presión y evita recordatorios más ruidosos después.",
        minimal,
        "Todavía estás a tiempo de ordenar lo que viene.",
      ),
      ctaLabel: "Planificar próximas",
      href: taskListRoute("due=soon&view=list"),
      items: signals.dueSoon,
      icon: Clock3,
      score,
      toneLabel: "Preventivo",
      compactHint: "Puedes anticiparte antes de que suba la presión.",
    });
  }

  const pressureLoad = signals.overdue.length + signals.dueToday.length + signals.waitingReview.length;
  if (pressureLoad >= 5) {
    cards.push({
      id: "pressure",
      mood: signals.overdue.length >= 2 ? "critical" : "attention",
      title: "Hoy conviene entrar con foco, no con volumen",
      body: concise(
        `Detectamos ${pressureLoad} señales activas entre vencidas, entregas de hoy y frentes en pausa. Lo mejor es limpiar primero lo crítico y luego abrir nuevas tareas.`,
        minimal,
        `Hay ${pressureLoad} señales activas. Prioriza antes de abrir más frentes.`,
      ),
      ctaLabel: "Ir al tablero",
      href: asRoute("/app/board"),
      items: [...signals.overdue, ...signals.dueToday, ...signals.waitingReview].slice(0, 6),
      icon: Sparkles,
      score: 88 + pressureLoad * 6,
      toneLabel: "Radar operativo",
      compactHint: "El sistema recomienda foco antes de volumen.",
    });
  }

  if (!cards.length) {
    cards.push({
      id: "clear",
      mood: "calm",
      title: "Todo se ve bajo control por ahora",
      body: concise(
        "No detectamos nada fuera de tiempo ni una entrega que pida correr. Puedes entrar directo a foco o revisar la pizarra con calma.",
        minimal,
        "No hay alertas fuertes en este workspace.",
      ),
      ctaLabel: "Abrir pizarra",
      href: asRoute("/app/board"),
      items: [],
      icon: CheckCircle2,
      score: 10,
      toneLabel: "Estable",
      compactHint: "Puedes trabajar con calma.",
    });
  }

  const moodRank = { critical: 0, attention: 1, calm: 2 } as const;

  return cards
    .filter((card) => {
      if (settings.sensitivity === "critical") return card.mood === "critical";
      if (settings.sensitivity === "focus") return card.mood !== "calm";
      return true;
    })
    .sort((a, b) => (b.score - a.score) || (moodRank[a.mood] - moodRank[b.mood]));
}
