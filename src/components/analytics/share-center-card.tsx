'use client';

import { useMemo, useState } from 'react';
import { Copy, ExternalLink, FileSpreadsheet, Mail, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { WorkspaceAnalyticsSummary } from '@/lib/queries/analytics';
import { buildSharedAnalyticsPayload, downloadAnalyticsCsv, encodeAnalyticsShareToken, triggerAnalyticsPdf } from '@/lib/share/analytics-share';

export function ShareCenterCard({ summary }: { summary: WorkspaceAnalyticsSummary }) {
  const [feedback, setFeedback] = useState<string>('');

  const sharePayload = useMemo(() => buildSharedAnalyticsPayload(summary), [summary]);
  const shareUrl = useMemo(() => {
    const token = encodeAnalyticsShareToken(sharePayload);
    return typeof window === 'undefined' ? `/share/${token}` : `${window.location.origin}/share/${token}`;
  }, [sharePayload]);

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
    <Card className="border-cyan-200 bg-[linear-gradient(135deg,#052e2b_0%,#0b3954_42%,#0f172a_100%)] text-white shadow-[0_24px_60px_rgba(8,47,73,0.18)]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/80">Share center</p>
          <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-[1.8rem]">Deja listo un reporte ejecutivo que se entiende al primer vistazo</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-100/90 sm:text-base">
            Abre una landing pública, comparte el enlace o envíalo por correo con un formato limpio y presentable para jefatura.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:w-[360px]">
          <Button className="bg-white text-slate-950 hover:bg-cyan-50" onClick={handleCopy}><Copy className="h-4 w-4" />Copiar link</Button>
          <a href={shareUrl} target="_blank" rel="noreferrer"><Button className="w-full bg-white/12 text-white hover:bg-white/18"><ExternalLink className="h-4 w-4" />Ver landing</Button></a>
          <Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:border-white/30" onClick={() => triggerAnalyticsPdf(shareUrl)}><Printer className="h-4 w-4" />Descargar PDF</Button>
          <Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:border-white/30" onClick={() => downloadAnalyticsCsv(sharePayload)}><FileSpreadsheet className="h-4 w-4" />Excel / CSV</Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] xl:items-start">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MiniMetric label="Favoritos" value={summary.shareDigest.priorityCount} helper="Seguimiento clave" />
          <MiniMetric label="En proceso" value={summary.shareDigest.inProgressCount} helper="Trabajo activo" />
          <MiniMetric label="En espera" value={summary.shareDigest.waitingCount} helper="Pide destrabe" />
          <MiniMetric label="Concluidos" value={summary.shareDigest.completedCount} helper="Avance visible" />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100/75">Enviar por correo</p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-100/85">
                Landing, PDF y Excel listos para compartir en un formato claro y profesional.
              </p>
            </div>
            {feedback ? <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-cyan-100">{feedback}</span> : null}
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <a className="flex-1" href={`mailto:?subject=${encodeURIComponent(subject)}&body=${body}`}>
              <Button variant="secondary" className="w-full border-white/20 bg-white/10 text-white hover:bg-white/15 hover:border-white/30"><Mail className="h-4 w-4" />Enviar correo</Button>
            </a>
            <a className="flex-1" href={shareUrl} target="_blank" rel="noreferrer">
              <Button variant="secondary" className="w-full border-white/20 bg-white/10 text-white hover:bg-white/15 hover:border-white/30"><ExternalLink className="h-4 w-4" />Abrir landing</Button>
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}

function MiniMetric({ label, value, helper }: { label: string; value: number; helper: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100/75">{label}</p>
      <p className="mt-1.5 text-[1.7rem] font-bold leading-none text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-200/80">{helper}</p>
    </div>
  );
}
