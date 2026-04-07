'use client';

import { useMemo, useState } from 'react';
import { Copy, ExternalLink, FileSpreadsheet, Mail, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { WorkspaceAnalyticsSummary } from '@/lib/queries/analytics';
import { buildSharedAnalyticsPayload, downloadAnalyticsCsv, encodeAnalyticsShareToken, triggerAnalyticsPdf } from '@/lib/share/analytics-share';

export function ShareCenterCard({ summary }: { summary: WorkspaceAnalyticsSummary }) {
  const [feedback, setFeedback] = useState<string>('');

  const shareUrl = useMemo(() => {
    const payload = buildSharedAnalyticsPayload(summary);
    const token = encodeAnalyticsShareToken(payload);
    return typeof window === 'undefined' ? `/share/${token}` : `${window.location.origin}/share/${token}`;
  }, [summary]);

  const subject = `FlowTask · reporte ejecutivo ${summary.organizationName}`;
  const body = `Hola,%0D%0A%0D%0ATe comparto el reporte ejecutivo de ${summary.organizationName}.%0D%0A${encodeURIComponent(shareUrl)}%0D%0A%0D%0AResumen:%0D%0A${summary.shareDigest.shareSummary.map((item) => `- ${item}`).join('%0D%0A')}`;

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
    <Card className="border-violet-200 bg-[linear-gradient(135deg,#312e81_0%,#6d28d9_45%,#0f172a_100%)] text-white shadow-[0_24px_60px_rgba(49,46,129,0.22)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100/80">Share center</p>
          <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-[1.75rem]">Comparte un reporte ejecutivo fuera de la app</h2>
          <p className="mt-2 text-sm leading-6 text-violet-50/90">
            Genera una landing pública con resumen, deadlines y estado ejecutivo para jefatura. Sin login y con descarga rápida en PDF o Excel/CSV.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:w-[320px]">
          <Button className="bg-white text-slate-950 hover:bg-violet-50" onClick={handleCopy}><Copy className="h-4 w-4" />Copiar link</Button>
          <a href={shareUrl} target="_blank" rel="noreferrer"><Button className="w-full bg-white/12 text-white hover:bg-white/18"><ExternalLink className="h-4 w-4" />Ver landing</Button></a>
          <Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:border-white/30" onClick={() => triggerAnalyticsPdf(shareUrl)}><Printer className="h-4 w-4" />PDF</Button>
          <Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:border-white/30" onClick={() => downloadAnalyticsCsv(buildSharedAnalyticsPayload(summary))}><FileSpreadsheet className="h-4 w-4" />Excel / CSV</Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label="Favoritos" value={summary.shareDigest.priorityCount} />
        <MiniMetric label="En proceso" value={summary.shareDigest.inProgressCount} />
        <MiniMetric label="En espera" value={summary.shareDigest.waitingCount} />
        <MiniMetric label="Concluidos" value={summary.shareDigest.completedCount} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-2">
          {summary.shareDigest.shareSummary.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm leading-6 text-violet-50/90">
              {item}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
          <a href={`mailto:?subject=${encodeURIComponent(subject)}&body=${body}`}><Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:border-white/30"><Mail className="h-4 w-4" />Enviar por correo</Button></a>
          {feedback ? <p className="text-xs font-semibold text-violet-100">{feedback}</p> : null}
        </div>
      </div>
    </Card>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-100/75">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
