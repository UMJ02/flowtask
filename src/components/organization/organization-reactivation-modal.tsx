'use client';

import { useEffect, useState } from 'react';
import { AuthFeedbackModal } from '@/components/auth/auth-feedback-modal';

export function OrganizationReactivationModal({ openInitially = false }: { openInitially?: boolean }) {
  const [open, setOpen] = useState(openInitially);

  useEffect(() => {
    if (!openInitially) return;
    const timeout = window.setTimeout(() => setOpen(false), 2400);
    return () => window.clearTimeout(timeout);
  }, [openInitially]);

  return (
    <AuthFeedbackModal
      open={open}
      title="Tu organización se reactivó"
      message="El workspace volvió a estar disponible y puedes seguir trabajando con tus datos del equipo sin perder el espacio personal."
      tone="success"
    />
  );
}
