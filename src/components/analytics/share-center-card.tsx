'use client';

import { useMemo, useState } from 'react';
import { Copy, ExternalLink, FileSpreadsheet, Mail, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { WorkspaceAnalyticsSummary } from '@/lib/queries/analytics';
import { buildSharedAnalyticsPayload, downloadAnalyticsCsv, encodeAnalyticsShareToken, triggerAnalyticsPdf } from '@/lib/share/analytics-share';

export function ShareCenterCard({ summary }: { summary: WorkspaceAnalyticsSummary }) {
  const [feedback, setFeedback] = useState('');

  const shareUrl = useMemo(() => {
    const payload = buildSharedAnalyticsPayload(summary);
    const token = encodeAnalyticsShareToken(payload);
    return typeof window === 'undefined' ? `/share/${token}` : `${window.location.origin}/share/${token}`;
  }, [summary]);

  const sharePayload = useMemo(() => buildSharedAnalyticsPayload(summary), [summary]);
  const subject = `FlowTask · reporte ejecutivo ${summary.organizationName}`;
  const body = `Hola,%0D%0A%0D%0ATe comparto un resumen ejecutivo de ${summary.organizationName}.%0D%0A${encodeURIComponent(shareUrl)}%0D%0A%0D%0APuntos clave:%0D%0A${summary.shareDigest.shareSummary.map((item) => `- ${item}`).join('%0D%0A')}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setFeedback('Link copiado');
      window.setTimeout(() => setFeedback(''), 1800);
    } catch {
      setFeedback('No se pudo copiar');
    }
  };

  return (
    <Card className="rounded-[30px] border border-cyan-100/90 bg-[linear-gradient(135deg,#083344_0%,#0f3f5e_45%,#0f172a_100%)] text-white shadow-[0_24px_60px_rgba(8,47,73,0.18)]">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] xl:items-start">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/80">Share center</p>
          <h2 className="mt-2 text-[1.9rem] font-bold leading-tight sm:text-[2.2rem]">Comparte el reporte sin complicarle la vida a nadie</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-100/90 sm:text-base">
            Comparte una landing elegante con prioridades, fechas y avance general para que tu jefatura lo entienda en minutos, sin entrar a la app.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button className="h-11 rounded-full bg-white text-slate-950 hover:bg-cyan-50" onClick={handleCopy}><Copy className="h-4 w-4" />Copiar link</Button>
          <a href={shareUrl} target="_blank" rel="noreferrer"><Button className="h-11 w-full rounded-full bg-white/12 text-white hover:bg-white/18"><ExternalLink className="h-4 w-4" />Ver landing</Button></a>
          <Button variant="secondary" className="h-11 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15 hover:border-white/30" onClick={() => triggerAnalyticsPdf(shareUrl)}><Printer className="h-4 w-4" />Descargar PDF</Button>
          <Button variant="secondary" className="h-11 rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15 hover:border-white/30" onClick={() => downloadAnalyticsCsv(sharePayload)}><FileSpreadsheet className="h-4 w-4" />Excel / CSV</Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(260px,0.92fr)] xl:items-stretch">
        <MiniMetric label="Favoritos" value={summary.shareDigest.priorityCount} helper="Seguimiento clave" tone="amber" />
        <MiniMetric label="En proceso" value={summary.shareDigest.inProgressCount} helper="Trabajo activo" tone="cyan" />
        <MiniMetric label="En espera" value={summary.shareDigest.waitingCount} helper="Pide destrabe" tone="violet" />
        <MiniMetric label="Concluidos" value={summary.shareDigest.completedCount} helper="Avance visible" tone="emerald" />

        <div className="rounded-[24px] border border-white/10 bg-white/10 px-4 py-4 md:col-span-2 xl:col-span-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100/75">Enviar por correo</p>
          <p className="mt-2 text-sm leading-6 text-slate-100/85">
            Abre la landing, copia el enlace o compártelo por correo en un formato claro y presentable.
          </p>
          <div className="mt-3">
            <a href={`mailto:?subject=${encodeURIComponent(subject)}&body=${body}`}>
              <Button variant="secondary" className="h-11 w-full rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15 hover:border-white/30"><Mail className="h-4 w-4" />Enviar por correo</Button>
            </a>
          </div>
          {feedback ? <p className="mt-3 text-xs font-semibold text-cyan-100">{feedback}</p> : null}
        </div>
      </div>
    </Card>
  );
}

function MiniMetric({ label, value, helper, tone }: { label: string; value: number; helper: string; tone: 'amber' | 'cyan' | 'violet' | 'emerald' }) {
  const toneMap = {
    amber: 'border-amber-200/30 bg-amber-400/10 text-amber-50',
    cyan: 'border-cyan-200/30 bg-cyan-400/10 text-cyan-50',
    violet: 'border-violet-200/30 bg-violet-400/10 text-violet-50',
    emerald: 'border-emerald-200/30 bg-emerald-400/10 text-emerald-50',
  } as const;

  return (
    <div className={`rounded-[22px] border px-4 py-3 ${toneMap[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-80">{label}</p>
      <p className="mt-1.5 text-[1.9rem] font-bold leading-none">{value}</p>
      <p className="mt-1 text-xs opacity-80">{helper}</p>
    </div>
  );
}
