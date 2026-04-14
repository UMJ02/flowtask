"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, Settings2, Sparkles, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS,
  INTELLIGENT_ASSISTANT_SETTINGS_KEY,
  normalizeIntelligentAssistantSettings,
  type IntelligentAssistantSettings,
} from "@/lib/assistant/reminder-settings";
import { buildAssistantCards, type AssistantSignals } from "@/lib/assistant/advanced-engine";
import { taskDetailRoute } from "@/lib/navigation/routes";

type Props = {
  workspaceKey: string;
  workspaceLabel?: string;
  location?: "dashboard" | "organization";
  signals: AssistantSignals;
  notificationsEnabled?: boolean;
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

const moodStyles = {
  critical: "border-rose-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,245,247,0.98))]",
  attention: "border-amber-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,251,244,0.98))]",
  calm: "border-emerald-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(245,252,249,0.98))]",
} as const;

const motionStyles = {
  off: "",
  soft: "transition-all duration-300",
  expressive: "transition-all duration-500",
} as const;

const scoreToneStyles = {
  critical: "bg-slate-950 text-white",
  attention: "bg-white text-slate-800 ring-1 ring-slate-200",
  calm: "bg-white text-slate-700 ring-1 ring-slate-200",
} as const;

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

  const cards = useMemo(() => buildAssistantCards(signals, settings), [signals, settings]);
  const activeCard = cards[0];

  useEffect(() => {
    if (!hydrated || !activeCard) return;
    if (!notificationsEnabled || !settings.enabled) {
      setVisible(false);
      return;
    }
    if (settings.showOnDashboardOnly && location !== "dashboard") {
      setVisible(false);
      return;
    }
    if (location === "organization" && !settings.showWorkspaceAlertsInOrganizations) {
      setVisible(false);
      return;
    }

    const scopeKey = settings.allowWorkspaceSpecificHistory ? workspaceKey : "global";
    const snoozeKey = `flowtask:intelligent-assistant:snooze:${scopeKey}`;
    const dismissedKey = `flowtask:intelligent-assistant:dismissed:${scopeKey}:${activeCard.id}`;
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

    const timer = window.setTimeout(() => setVisible(true), settings.animationLevel === "expressive" ? 220 : 120);
    return () => window.clearTimeout(timer);
  }, [hydrated, activeCard, workspaceKey, settings, notificationsEnabled, location]);

  if (!activeCard || !hydrated || !settings.enabled || !notificationsEnabled || !visible) return null;

  const Icon = activeCard.icon;
  const mascotSrc = activeCard.mood === "critical" || activeCard.mood === "attention" ? "/assistant/guide-male.png" : "/assistant/guide-female.png";
  const scopeKey = settings.allowWorkspaceSpecificHistory ? workspaceKey : "global";

  const dismissForNow = () => {
    window.sessionStorage.setItem(`flowtask:intelligent-assistant:dismissed:${scopeKey}:${activeCard.id}`, String(Date.now()));
    setVisible(false);
  };

  const snooze = (minutes = settings.defaultSnoozeMinutes) => {
    window.localStorage.setItem(`flowtask:intelligent-assistant:snooze:${scopeKey}`, String(Date.now() + minutes * 60 * 1000));
    setVisible(false);
  };

  const previewItems = activeCard.items.slice(0, settings.maxPreviewItems);

  return (
    <Card
      className={[
        "relative overflow-hidden rounded-[28px] border px-0 py-0 shadow-[0_16px_36px_rgba(15,23,42,0.07)]",
        moodStyles[activeCard.mood],
        motionStyles[settings.animationLevel],
        visible && settings.animationLevel !== "off" ? "translate-y-0 opacity-100" : "opacity-100",
      ].join(" ")}
    >
      <div className="relative px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Radar inteligente · {workspaceLabel}
          </div>
          <button
            type="button"
            onClick={dismissForNow}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/85 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            aria-label="Ocultar recordatorio"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-end">
          {settings.showMascot ? (
            <div className="relative hidden h-[240px] overflow-hidden lg:block">
              <Image src={mascotSrc} alt="Asistente de FlowTask" fill sizes="180px" className="object-contain object-bottom" priority />
            </div>
          ) : null}

          <div className="min-w-0">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/92 text-slate-900 shadow-sm">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={["rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]", scoreToneStyles[activeCard.mood]].join(" ")}>{activeCard.toneLabel}</span>
                  <span className="rounded-full border border-white/80 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-600">Score {activeCard.score}</span>
                </div>
                <h2 className="mt-2 max-w-3xl text-[1.8rem] font-semibold leading-tight tracking-tight text-slate-950 sm:text-[2rem]">{activeCard.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{settings.verbosity === "minimal" ? activeCard.compactHint : activeCard.body}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <Link href={activeCard.href} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900">
                {activeCard.ctaLabel}
              </Link>
              <Button type="button" variant="secondary" className="rounded-full px-4" onClick={() => snooze()}>
                Ver luego
              </Button>
              <Button type="button" variant="secondary" className="rounded-full px-4" onClick={() => setExpanded((value) => !value)}>
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {expanded ? "Ocultar detalle" : "Ver detalle"}
              </Button>
              <Link href="/settings" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900">
                <Settings2 className="h-4 w-4" />
                Ver ajustes
              </Link>
            </div>

            <div className={[
              "grid overflow-hidden transition-all duration-300",
              expanded ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            ].join(" ")}>
              <div className="min-h-0">
                <div className="rounded-[22px] border border-white/80 bg-white/82 p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">Qué revisar primero</p>
                    <span className="text-xs font-medium text-slate-500">{activeCard.items.length} elemento(s)</span>
                  </div>
                  <div className="mt-3 grid gap-2 lg:grid-cols-2">
                    {previewItems.length ? previewItems.map((item) => (
                      <Link
                        key={item.id}
                        href={taskDetailRoute(item.id)}
                        className="rounded-[18px] border border-slate-200/80 bg-white px-3 py-3 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_12px_22px_rgba(15,23,42,0.06)]"
                      >
                        <p className="line-clamp-1 text-sm font-semibold text-slate-900">{item.title}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                          <span className="rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-200">{item.client_name || "Sin cliente"}</span>
                          <span className="rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-200">{formatDueLabel(item.due_date)}</span>
                        </div>
                      </Link>
                    )) : (
                      <div className="rounded-[18px] border border-slate-200/80 bg-white px-3 py-4 text-sm text-slate-600 lg:col-span-2">
                        No hay elementos críticos abiertos en este workspace por ahora.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}