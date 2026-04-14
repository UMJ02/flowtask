"use client";

import { useEffect, useState } from "react";
import { BellRing, BrainCircuit, Gauge, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS,
  INTELLIGENT_ASSISTANT_SETTINGS_KEY,
  normalizeIntelligentAssistantSettings,
  type IntelligentAssistantSettings,
  type IntelligentAssistantSensitivity,
} from "@/lib/assistant/reminder-settings";

const SENSITIVITY_LABELS: Record<IntelligentAssistantSensitivity, { title: string; body: string }> = {
  critical: {
    title: "Solo crítico",
    body: "Te avisa únicamente cuando algo ya está vencido o pide acción inmediata.",
  },
  focus: {
    title: "En foco",
    body: "Equilibrio recomendado: urgencias + tareas que conviene revisar pronto.",
  },
  balanced: {
    title: "Panorama completo",
    body: "Incluye señales preventivas para que llegues antes de que se acumulen.",
  },
};

export function IntelligentAttentionSettingsCard() {
  const [settings, setSettings] = useState<IntelligentAssistantSettings>(DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(INTELLIGENT_ASSISTANT_SETTINGS_KEY);
      if (raw) setSettings(normalizeIntelligentAssistantSettings(JSON.parse(raw)));
    } catch {}
  }, []);

  const persist = (next: IntelligentAssistantSettings) => {
    const normalized = normalizeIntelligentAssistantSettings(next);
    setSettings(normalized);
    window.localStorage.setItem(INTELLIGENT_ASSISTANT_SETTINGS_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new StorageEvent("storage", { key: INTELLIGENT_ASSISTANT_SETTINGS_KEY, newValue: JSON.stringify(normalized) }));
    setSaved("Preferencias del asistente guardadas.");
    window.setTimeout(() => setSaved(null), 1800);
  };

  return (
    <Card className="rounded-[22px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 ring-1 ring-emerald-100">
            <BrainCircuit className="h-3.5 w-3.5" />
            Asistente inteligente
          </div>
          <h3 className="mt-3 text-xl font-semibold text-slate-900">Recordatorios que te ayudan a priorizar sin llenar la vista de ruido</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Ajusta la intensidad de los pull-up cards, el tiempo de descanso entre avisos y si quieres ver al asistente visual en el dashboard.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="rounded-full"
          onClick={() => persist({ ...settings, enabled: !settings.enabled })}
        >
          <BellRing className="h-4 w-4" />
          {settings.enabled ? "Pausar asistente" : "Activar asistente"}
        </Button>
      </div>

      {saved ? <p className="mt-3 text-sm font-medium text-emerald-700">{saved}</p> : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-slate-900">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-semibold">Intensidad de ayuda</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {(Object.keys(SENSITIVITY_LABELS) as IntelligentAssistantSensitivity[]).map((key) => {
              const active = settings.sensitivity === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => persist({ ...settings, sensitivity: key })}
                  className={active
                    ? "rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-left shadow-sm"
                    : "rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 text-left hover:border-slate-300 hover:bg-white"}
                >
                  <p className="text-sm font-semibold text-slate-900">{SENSITIVITY_LABELS[key].title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{SENSITIVITY_LABELS[key].body}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-slate-900">
            <Gauge className="h-4 w-4 text-slate-700" />
            <p className="text-sm font-semibold">Frecuencia y presencia visual</p>
          </div>

          <label className="mt-4 block">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-700">Minutos de descanso entre avisos</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{settings.cadenceMinutes} min</span>
            </div>
            <input
              type="range"
              min={10}
              max={180}
              step={5}
              value={settings.cadenceMinutes}
              onChange={(event) => persist({ ...settings, cadenceMinutes: Number(event.target.value) })}
              className="mt-3 w-full"
            />
          </label>

          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Mostrar personaje guía</p>
                <p className="mt-1 text-sm text-slate-500">Úsalo para darle más calidez a los recordatorios visuales.</p>
              </div>
              <input type="checkbox" checked={settings.showMascot} onChange={(event) => persist({ ...settings, showMascot: event.target.checked })} className="h-4 w-4" />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Solo en dashboard</p>
                <p className="mt-1 text-sm text-slate-500">Mantiene la guía principal al entrar, sin invadir otras vistas.</p>
              </div>
              <input type="checkbox" checked={settings.showOnDashboardOnly} onChange={(event) => persist({ ...settings, showOnDashboardOnly: event.target.checked })} className="h-4 w-4" />
            </label>
          </div>
        </div>
      </div>
    </Card>
  );
}
