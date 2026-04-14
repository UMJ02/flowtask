"use client";

import { useEffect, useState } from "react";
import { BellRing, BrainCircuit, Gauge, Sparkles, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_INTELLIGENT_ASSISTANT_SETTINGS,
  INTELLIGENT_ASSISTANT_SETTINGS_KEY,
  normalizeIntelligentAssistantSettings,
  type IntelligentAssistantSettings,
  type IntelligentAssistantSensitivity,
  type IntelligentAssistantRuleKey,
} from "@/lib/assistant/reminder-settings";

const SENSITIVITY_LABELS: Record<IntelligentAssistantSensitivity, { title: string; body: string }> = {
  critical: { title: "Solo crítico", body: "Muestra únicamente lo que ya requiere acción inmediata." },
  focus: { title: "En foco", body: "Prioriza urgencias y seguimientos sin llenar la vista." },
  balanced: { title: "Balanceado", body: "Deja ver lo urgente y lo próximo con una lectura limpia." },
  adaptive: { title: "Adaptativo", body: "Ordena los avisos por impacto y contexto del workspace." },
};

const RULES: Array<{ key: IntelligentAssistantRuleKey; title: string; body: string }> = [
  { key: 'overdue', title: 'Vencidas', body: 'Trabajo que ya se pasó de fecha.' },
  { key: 'dueToday', title: 'Hoy', body: 'Entregas del día en curso.' },
  { key: 'dueSoon', title: 'Próximas', body: 'Tareas que vienen cerca.' },
  { key: 'waitingReview', title: 'En espera', body: 'Frentes que piden revisión.' },
  { key: 'stale', title: 'Sin movimiento', body: 'Items quietos desde hace días.' },
  { key: 'noDueDate', title: 'Sin fecha', body: 'Trabajo abierto sin deadline.' },
];

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
    <Card className="rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 ring-1 ring-emerald-100">
            <BrainCircuit className="h-3.5 w-3.5" />
            Asistente inteligente avanzado
          </div>
          <h3 className="mt-3 text-xl font-semibold text-slate-900">Menos ruido, mejor criterio y memoria por workspace</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Define qué señales quieres ver, cuántos cards pueden aparecer y si cada workspace debe recordar su propio ritmo.</p>
        </div>
        <Button type="button" variant="secondary" className="rounded-full" onClick={() => persist({ ...settings, enabled: !settings.enabled })}>
          <BellRing className="h-4 w-4" />
          {settings.enabled ? "Pausar asistente" : "Activar asistente"}
        </Button>
      </div>

      {saved ? <p className="mt-3 text-sm font-medium text-emerald-700">{saved}</p> : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <div className="rounded-[22px] border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-slate-900">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-semibold">Nivel de inteligencia</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(Object.keys(SENSITIVITY_LABELS) as IntelligentAssistantSensitivity[]).map((key) => {
              const active = settings.sensitivity === key;
              return (
                <button key={key} type="button" onClick={() => persist({ ...settings, sensitivity: key })} className={active ? "rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-left shadow-sm" : "rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 text-left hover:border-slate-300 hover:bg-white"}>
                  <p className="text-sm font-semibold text-slate-900">{SENSITIVITY_LABELS[key].title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{SENSITIVITY_LABELS[key].body}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-900">
              <SlidersHorizontal className="h-4 w-4 text-slate-700" />
              <p className="text-sm font-semibold">Reglas activas</p>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {RULES.map((rule) => (
                <label key={rule.key} className="flex items-start justify-between gap-3 rounded-[18px] border border-slate-200 bg-white px-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{rule.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{rule.body}</p>
                  </div>
                  <input type="checkbox" checked={settings.rules[rule.key]} onChange={(event) => persist({ ...settings, rules: { ...settings.rules, [rule.key]: event.target.checked } })} className="mt-1 h-4 w-4" />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-slate-900">
            <Gauge className="h-4 w-4 text-slate-700" />
            <p className="text-sm font-semibold">Cadencia y presencia visual</p>
          </div>

          <label className="mt-4 block">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-700">Minutos de descanso</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{settings.cadenceMinutes} min</span>
            </div>
            <input type="range" min={10} max={180} step={5} value={settings.cadenceMinutes} onChange={(event) => persist({ ...settings, cadenceMinutes: Number(event.target.value) })} className="mt-3 w-full" />
          </label>

          <label className="mt-4 block">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-700">Máximo de cards simultáneos</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{settings.maxCards}</span>
            </div>
            <input type="range" min={1} max={3} step={1} value={settings.maxCards} onChange={(event) => persist({ ...settings, maxCards: Number(event.target.value) as 1|2|3 })} className="mt-3 w-full" />
          </label>

          <div className="mt-4 space-y-3">
            {[
              { key: 'showMascot', title: 'Mostrar personaje guía', body: 'Da más calidez a los avisos importantes.' },
              { key: 'showOnDashboardOnly', title: 'Solo en dashboard', body: 'Evita invadir otras vistas del flujo.' },
              { key: 'compactMode', title: 'Modo compacto', body: 'Reduce texto y prioriza el resumen.' },
              { key: 'workspaceAware', title: 'Memoria por workspace', body: 'Cada espacio recuerda sus silencios y cierres.' },
            ].map((option) => (
              <label key={option.key} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{option.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{option.body}</p>
                </div>
                <input type="checkbox" checked={Boolean(settings[option.key as keyof IntelligentAssistantSettings])} onChange={(event) => persist({ ...settings, [option.key]: event.target.checked } as IntelligentAssistantSettings)} className="h-4 w-4" />
              </label>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
