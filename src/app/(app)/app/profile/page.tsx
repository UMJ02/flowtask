export const dynamic = 'force-dynamic';

import { Camera, KeyRound, Mail, UserRound } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ProfileSettingsForm } from '@/components/settings/profile-settings-form';
import { getCurrentProfile } from '@/lib/queries/profile';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function ProfilePage() {
  const profile = await safeServerCall('getCurrentProfile', () => getCurrentProfile(), null);

  return (
    <div className="space-y-4">
      <Card className="bg-[linear-gradient(135deg,#0f172a_0%,#111827_55%,#1e293b_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Perfil</p>
            <h1 className="mt-2 text-3xl font-bold">Tu identidad dentro de FlowTask</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Gestiona nombre, correo, contraseña y foto de perfil desde una sola vista clara y segura.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: UserRound, label: 'Nombre', value: profile?.fullName?.trim() || 'Sin definir' },
              { icon: Mail, label: 'Correo', value: profile?.email || 'Sin correo' },
              { icon: Camera, label: 'Foto', value: profile?.avatarUrl ? 'Configurada' : 'Pendiente' },
              { icon: KeyRound, label: 'Acceso', value: 'Protegido' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[24px] bg-white/10 px-4 py-3 ring-1 ring-white/10">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Icon className="h-4 w-4" />
                    <p className="text-xs uppercase tracking-[0.16em]">{item.label}</p>
                  </div>
                  <p className="mt-3 text-base font-semibold text-white">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Editar perfil</h2>
        <p className="mt-1 text-sm text-slate-500">Actualiza tus datos sin mezclar esta vista con la configuración operativa.</p>
        <div className="mt-4">
          <ProfileSettingsForm
            initialFullName={profile?.fullName ?? ''}
            email={profile?.email ?? ''}
            initialAvatarUrl={profile?.avatarUrl ?? ''}
          />
        </div>
      </Card>
    </div>
  );
}
