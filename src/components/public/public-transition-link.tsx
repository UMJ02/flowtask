'use client';

import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { AuthPremiumLoader } from '@/components/ui/auth-premium-loader';

const PUBLIC_TRANSITION_MS = 3400;

export function PublicTransitionLink({
  href,
  children,
  className,
  title = 'Preparando tu espacio…',
  description = 'Estamos cargando Flowtask.',
}: {
  href: string;
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <>
      <a
        href={href}
        className={className}
        aria-busy={pending}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
          event.preventDefault();
          if (pending) return;
          setPending(true);
          window.setTimeout(() => router.push(href), PUBLIC_TRANSITION_MS);
        }}
      >
        {children}
      </a>
      {pending ? (
        <div className="fixed inset-0 z-[9999]">
          <AuthPremiumLoader title={title} description={description} />
        </div>
      ) : null}
    </>
  );
}
