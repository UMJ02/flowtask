'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, ExternalLink, FileSpreadsheet, Mail, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { WorkspaceAnalyticsSummary } from '@/lib/queries/analytics';
import { buildLegacyAnalyticsShareUrl, buildSharedAnalyticsPayload, createStoredAnalyticsShare, downloadAnalyticsCsv, triggerAnalyticsPdf } from '@/lib/share/analytics-share';

export function ShareCenterCard({ summary }: { summary: WorkspaceAnalyticsSummary }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string>('');
  const [openingLanding, setOpeningLanding] = useState(false);
  const [creatingLink, setCreatingLink] = useState(false);
  const [shortUrl, setShortUrl] = useState<string>('');

  const sharePayload = useMemo(() => buildSharedAnalyticsPayload(summary), [summary]);
  const legacyShareUrl = useMemo(() => buildLegacyAnalyticsShareUrl(sharePayload), [sharePayload]);
  const activeShareUrl = shortUrl || legacyShareUrl;
  const subject = `FlowTask · reporte ejecutivo ${summary.organizationName}`;
  const body = `Hola,%0D%0A%0D%0ATe comparto un resumen ejecutivo de ${summary.organizationName}.%0D%0A${encodeURIComponent(activeShareUrl)}%0D%0A%0D%0APuntos clave:%0D%0A${summary.shareDigest.shareSummary.map((item) => `- ${item}`).join('%0D%0A')}`;

  const ensureShortUrl = async () => {
    if (shortUrl) return shortUrl;
    setCreatingLink(true);
    try {
      const stored = await createStoredAnalyticsShare(sharePayload);
      setShortUrl(stored.url);
      return stored.url;
    } finally {
      setCreatingLink(false);
    }
  };

  const openLanding = async () => {
    setOpeningLanding(true);
    try {
      const url = await ensureShortUrl();
      router.push(new URL(url).pathname);
    } catch {
      router.push(new URL(legacyShareUrl, window.location.origin).pathname + new URL(legacyShareUrl, window.location.origin).search);
    } finally {
      setOpeningLanding(false);
    }
  };

  const handleCopy = async () => {
    try {
      const url = await ensureShortUrl();
      await navigator.clipboard.writeText(url);
      setFeedback('Link corto copiado');
      window.setTimeout(() => setFeedback(''), 1800);
    } catch {
      try {
        await navigator.clipboard.writeText(legacyShareUrl);
        setFeedback('Link copiado en modo compatible');
      } catch {
        setFeedback('No se pudo copiar');
      }
      window.setTimeout(() => setFeedback(''), 1800);
    }
  };

  return (
    <Card className="border-slate-200/80 bg-white px-4 py-4 md:px-5 md:py-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-3xl min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Share center</p>
          <h2 className="mt-1.5 text-[1.2rem] font-bold leading-tight text-slate-900 md:text-[1.35rem]">Comparte un reporte ejecutivo sin complicarlo</h2>
          <p className="mt-1.5 max-w-2xl text-[14px] leading-6 text-slate-600 sm:text-[15px]">
            Genera un link corto guardado en FlowTask, abre la landing o envíala por correo desde un bloque más limpio y directo para jefatura.
          </p>
          <p className="mt-2 break-all rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
            {shortUrl ? shortUrl : 'El link corto se genera al copiar o abrir la landing.'}
          </p>
          {feedback ? <p className="mt-2 text-xs font-semibold text-emerald-700">{feedback}</p> : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:w-[520px]">
          <Button className="bg-slate-950 text-white hover:bg-slate-900" loading={creatingLink} onClick={handleCopy}><Copy className="h-4 w-4" />{creatingLink ? 'Generando…' : 'Copiar link corto'}</Button>
          <Button variant="secondary" className="w-full" loading={openingLanding} onClick={openLanding}><ExternalLink className="h-4 w-4" />{openingLanding ? 'Abriendo…' : 'Ver landing'}</Button>
          <Button variant="secondary" onClick={() => triggerAnalyticsPdf(activeShareUrl)}><Printer className="h-4 w-4" />Descargar PDF</Button>
          <Button variant="secondary" onClick={() => downloadAnalyticsCsv(sharePayload)}><FileSpreadsheet className="h-4 w-4" />Excel</Button>
          <a href={`mailto:?subject=${encodeURIComponent(subject)}&body=${body}`} className="sm:col-span-2">
            <Button variant="secondary" className="w-full"><Mail className="h-4 w-4" />Enviar email</Button>
          </a>
        </div>
      </div>
    </Card>
  );
}
