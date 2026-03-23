import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 py-16">
      <div className="w-full">
        <EmptyState
          icon={<Compass className="h-6 w-6" />}
          title="No encontramos lo que buscas"
          description="El enlace puede haber cambiado, no existir o no estar disponible para tu organización actual."
          action={
            <Link href="/app/dashboard">
              <Button>Volver al dashboard</Button>
            </Link>
          }
        />
      </div>
    </main>
  );
}
