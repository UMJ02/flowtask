'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function InstallAppButton({ compact = false }: { compact?: boolean }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalled(standalone);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed || !deferredPrompt) return null;

  const handleInstall = async () => {
    setInstalling(true);
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setInstalling(false);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleInstall}
        disabled={installing}
        className="group relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-slate-900 hover:bg-slate-900 disabled:opacity-60"
        aria-label="Instalar app"
        title="Descargar app"
      >
        <Image
          src="/icons/iconoapp.png"
          alt="Descargar app"
          width={30}
          height={30}
          className="h-[30px] w-[30px] object-contain transition-all duration-300 group-hover:brightness-90"
        />
        <span className="pointer-events-none absolute right-0 top-full mt-2 translate-y-1 rounded-md bg-slate-950 px-3 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          {installing ? 'Instalando…' : 'Descargar app'}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      disabled={installing}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 disabled:opacity-60"
      aria-label="Instalar app"
    >
      <Download className="h-4 w-4" />
      {installing ? 'Instalando…' : 'Instalar app'}
    </button>
  );
}
