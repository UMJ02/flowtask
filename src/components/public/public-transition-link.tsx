'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AuthPremiumLoader } from '@/components/ui/auth-premium-loader';

const PUBLIC_TRANSITION_MS = 2500;

export function PublicTransitionLink({
  href,
  children,
  className,
  title = 'Cargando Flowtask…',
  description = '',
}: {
  href: string;
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    router.prefetch(href);
  }, [href, router]);

  const warmRoute = useCallback(() => {
    router.prefetch(href);
  }, [href, router]);

  const handleNavigate = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (pending) return;
    setPending(true);
    router.prefetch(href);
    window.setTimeout(() => router.push(href), PUBLIC_TRANSITION_MS);
  }, [href, pending, router]);

  return (
    <>
      <a
        href={href}
        className={className}
        aria-busy={pending}
        onPointerEnter={warmRoute}
        onFocus={warmRoute}
        onClick={handleNavigate}
      >
        {children}
      </a>
      {pending && mounted
        ? createPortal(<AuthPremiumLoader title={title} description={description} />, document.body)
        : null}
    </>
  );
}
