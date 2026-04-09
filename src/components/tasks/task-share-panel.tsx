"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAppUrl } from "@/lib/utils/app-url";

export function TaskSharePanel({ enabled, token, compact = false }: { enabled: boolean; token: string | null; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const link = useMemo(() => (enabled && token ? `${getAppUrl()}/share/task/${token}` : null), [enabled, token]);

  const copyLink = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card className={compact ? "h-full border border-slate-200 bg-white/95" : undefined}>
      <h3 className="text-lg font-semibold text-slate-900">Enlace compartido</h3>
      {!link ? (
        <p className="mt-2 text-sm text-slate-500">Activa la opción de compartir para mostrar esta tarea a jefatura.</p>
      ) : (
        <>
          <p className="mt-2 break-all rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{link}</p>
          <div className="mt-4 flex gap-3">
            <Button type="button" onClick={copyLink}>{copied ? "Copiado" : "Copiar link"}</Button>
            <a className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-100 px-4 text-sm font-medium text-slate-700" href={link} target="_blank" rel="noreferrer">
              Abrir vista
            </a>
          </div>
        </>
      )}
    </Card>
  );
}
