'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isiOS() {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        if (isLocalhost) {
          navigator.serviceWorker.getRegistrations()
            .then((registrations) => {
              registrations.forEach((registration) => registration.unregister().catch(() => undefined));
            })
            .catch(() => undefined);
          return;
        }

        navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => undefined);
      });
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const canShow = useMemo(() => !installed && !dismissed && (Boolean(deferredPrompt) || isiOS()), [deferredPrompt, dismissed, installed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstalled(true);
    }
    setDeferredPrompt(null);
    setInstalling(false);
  };

  if (!canShow) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[90] md:hidden">
      <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.16)] backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">Instala FlowTask en tu celular</p>
            <p className="mt-1 text-sm leading-5 text-slate-500">
              {deferredPrompt
                ? 'Ábrela más rápido desde tu pantalla principal y úsala como una app.'
                : 'En Safari toca compartir y luego “Agregar a pantalla de inicio”.'}
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => setDismissed(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {deferredPrompt ? (
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstall}
              disabled={installing}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {installing ? 'Instalando…' : 'Instalar app'}
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Ahora no
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
