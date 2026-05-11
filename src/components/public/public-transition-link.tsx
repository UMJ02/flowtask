'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, type MouseEvent, type ReactNode } from 'react';

export function PublicTransitionLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(href);
  }, [href, router]);

  const warmRoute = useCallback(() => {
    router.prefetch(href);
  }, [href, router]);

  const handleNavigate = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    router.prefetch(href);
    router.push(href);
  }, [href, router]);

  return (
    <a
      href={href}
      className={className}
      onPointerEnter={warmRoute}
      onFocus={warmRoute}
      onClick={handleNavigate}
    >
      {children}
    </a>
  );
}
