"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Settings2, Sparkles, X } from "lucide-react";
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
  critical: "border-rose-200/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.99),rgba(255,239,244,0.98),rgba(255,248,250,0.96))]",
  attention: "border-amber-200/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.99),rgba(255,247,234,0.98),rgba(255,252,245,0.96))]",
  calm: "border-emerald-200/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.99),rgba(239,252,245,0.98),rgba(246,252,248,0.96))]",
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

export function IntelligentAttentionAssistant({
  workspaceKey,
  workspaceLabel = "tu workspace",
  location = "dashboard",
  signals,
  notificationsEnabled = true,
}: Props) {
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
        "relative overflow-hidden rounded-[22px] border p-0 shadow-[0_16px_32px_rgba(15,23,42,0.08)]",
        moodStyles[activeCard.mood],
        motionStyles[settings.animationLevel],
        visible && settings.animationLevel !== "off" ? "translate-y-0 opacity-100" : "opacity-100",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[28%] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.75),transparent_58%)]" />
      <div className="relative px-3 py-2.5 sm:px-4 sm:py-3 lg:px-4 lg:py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/88 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Radar inteligente · {workspaceLabel}
          </div>
          <button
            type="button"
            onClick={dismissForNow}
            className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-full border border-slate-200/80 bg-white/88 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            aria-label="Ocultar recordatorio"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2.5 grid gap-3 lg:grid-cols-[160px_minmax(0,1fr)_200px] lg:items-center">
          {settings.showMascot ? (
            <div className="relative hidden h-[138px] lg:block">
              <Image
                src={mascotSrc}
                alt="Asistente de FlowTask"
                fill
                sizes="160px"
                className="object-contain object-bottom"
                priority
              />
            </div>
          ) : null}

          <div className="min-w-0">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/70 bg-emerald-50/90 text-emerald-700 shadow-sm">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 lg:pr-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={["rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]", scoreToneStyles[activeCard.mood]].join(" ")}>{activeCard.toneLabel}</span>
                  <span className="rounded-full border border-emerald-100 bg-emerald-50/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Score {activeCard.score}</span>
                </div>
                <h2 className="mt-2 max-w-3xl text-[0.98rem] font-semibold leading-tight tracking-tight text-slate-950 sm:text-[1.08rem]">{activeCard.title}</h2>
                <p className="mt-1 max-w-2xl text-[12px] leading-[1.45] text-slate-600">{settings.verbosity === "minimal" ? activeCard.compactHint : activeCard.body}</p>
              </div>
            </div>

            {expanded ? (
              <div className="mt-2.5 rounded-[16px] border border-white/90 bg-white/80 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Qué revisar</p>
                  <span className="text-[11px] font-medium text-slate-500">{activeCard.items.length} item(s)</span>
                </div>
                <div className="grid gap-2">
                  {previewItems.length ? previewItems.map((item) => (
                    <Link
                      key={item.id}
                      href={taskDetailRoute(item.id)}
                      className="flex items-center justify-between gap-3 rounded-[14px] border border-slate-200/85 bg-white px-3 py-2 transition hover:border-emerald-200 hover:bg-emerald-50/35"
                    >
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-[13px] font-semibold text-slate-900">{item.title}</p>
                        <div className="mt-0.5 flex flex-wrap gap-2 text-[11px] text-slate-500">
                          <span>{item.client_name || "Sin cliente"}</span>
                          <span>•</span>
                          <span>{formatDueLabel(item.due_date)}</span>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">Abrir</span>
                    </Link>
                  )) : (
                    <div className="rounded-[14px] border border-slate-200/80 bg-white px-3 py-2.5 text-sm text-slate-600">
                      No hay elementos críticos abiertos en este workspace por ahora.
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-col gap-2 lg:self-center">
            <Link href={activeCard.href} className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900">
              {activeCard.ctaLabel}
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/app/settings" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900">
                <Settings2 className="h-4 w-4" />
                Ajustes
              </Link>
              <Button type="button" variant="secondary" className="justify-center rounded-full px-3 py-2.5 text-sm" onClick={() => setExpanded((value) => !value)}>
                <ChevronDown className={["h-4 w-4 transition-transform", expanded ? "rotate-180" : ""].join(" ")} />
                {expanded ? "Menos" : "Detalle"}
              </Button>
            </div>
            <Button type="button" variant="secondary" className="rounded-full px-4 py-2.5 text-sm" onClick={() => snooze()}>
              Ver luego
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
