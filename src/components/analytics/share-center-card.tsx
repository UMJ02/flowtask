'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, ExternalLink, FileSpreadsheet, Mail, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { WorkspaceAnalyticsSummary } from '@/lib/queries/analytics';
import { buildSharedAnalyticsPayload, downloadAnalyticsCsv, encodeAnalyticsShareToken, triggerAnalyticsPdf } from '@/lib/share/analytics-share';

export function ShareCenterCard({ summary }: { summary: WorkspaceAnalyticsSummary }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string>('');
  const [openingLanding, setOpeningLanding] = useState(false);

  const shareUrl = useMemo(() => {
    const payload = buildSharedAnalyticsPayload(summary);
    const token = encodeAnalyticsShareToken(payload);
    return typeof window === 'undefined' ? `/share?data=${token}` : `${window.location.origin}/share?data=${token}`;
  }, [summary]);

  const sharePayload = useMemo(() => buildSharedAnalyticsPayload(summary), [summary]);
  const subject = `FlowTask · reporte ejecutivo ${summary.organizationName}`;
  const body = `Hola,%0D%0A%0D%0ATe comparto un resumen ejecutivo de ${summary.organizationName}.%0D%0A${encodeURIComponent(shareUrl)}%0D%0A%0D%0APuntos clave:%0D%0A${summary.shareDigest.shareSummary.map((item) => `- ${item}`).join('%0D%0A')}`;


  const openLanding = () => {
    setOpeningLanding(true);
    router.push(`/share?data=${encodeAnalyticsShareToken(sharePayload)}`);
  };

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
    <Card className="border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)] md:px-5 md:py-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-3xl min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Share center</p>
          <h2 className="mt-2 text-[1.35rem] font-bold leading-tight text-slate-900 md:text-[1.5rem]">Comparte un reporte ejecutivo sin complicarlo</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-[15px]">
            Copia el link, abre la landing o envíala por correo desde un bloque más limpio y directo para jefatura.
          </p>
          {feedback ? <p className="mt-2 text-xs font-semibold text-emerald-700">{feedback}</p> : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:w-[520px]">
          <Button className="bg-slate-950 text-white hover:bg-slate-900" onClick={handleCopy}><Copy className="h-4 w-4" />Copiar link</Button>
          <Button variant="secondary" className="w-full" loading={openingLanding} onClick={openLanding}><ExternalLink className="h-4 w-4" />{openingLanding ? 'Abriendo…' : 'Ver landing'}</Button>
          <Button variant="secondary" onClick={() => triggerAnalyticsPdf(shareUrl)}><Printer className="h-4 w-4" />Descargar PDF</Button>
          <Button variant="secondary" onClick={() => downloadAnalyticsCsv(sharePayload)}><FileSpreadsheet className="h-4 w-4" />Excel / CSV</Button>
          <a href={`mailto:?subject=${encodeURIComponent(subject)}&body=${body}`} className="sm:col-span-2">
            <Button variant="secondary" className="w-full"><Mail className="h-4 w-4" />Enviar email</Button>
          </a>
        </div>
      </div>
    </Card>
  );
}
