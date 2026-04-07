export const dynamic = 'force-dynamic';

import { Mail, UserRound } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ProfileSettingsForm } from '@/components/settings/profile-settings-form';
import { getCurrentProfile } from '@/lib/queries/profile';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function ProfilePage() {
  const profile = await safeServerCall('getCurrentProfile', () => getCurrentProfile(), null);

  const heroItems = [
    { icon: UserRound, label: 'Nombre visible', value: profile?.fullName?.trim() || 'Sin definir' },
    { icon: Mail, label: 'Correo principal', value: profile?.email || 'Sin correo' },
  ] as const;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#111827_55%,#1e293b_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Perfil</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Tu identidad dentro de FlowTask</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
              Gestiona nombre, correo, contraseña y foto de perfil desde una sola vista clara, segura y cómoda en desktop y móvil.
            </p>
          </div>

          <div className="grid w-full gap-3 md:grid-cols-2 xl:max-w-[820px]">
            {heroItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="min-w-0 rounded-[26px] bg-white/10 px-5 py-4 ring-1 ring-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Icon className="h-4 w-4" />
                    <p className="text-xs uppercase tracking-[0.16em]">{item.label}</p>
                  </div>
                  <p title={item.value} className="mt-3 overflow-hidden text-ellipsis break-words text-xl font-semibold leading-tight text-white md:text-2xl">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Editar perfil</h2>
        <p className="mt-1 text-sm text-slate-500">
          Aquí solo ves datos personales y seguridad básica. La configuración operativa sigue separada en Settings.
        </p>
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
