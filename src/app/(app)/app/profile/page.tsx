export const dynamic = 'force-dynamic';

import { Card } from '@/components/ui/card';
import { ProfileSettingsForm } from '@/components/settings/profile-settings-form';
import { getCurrentProfile } from '@/lib/queries/profile';
import { safeServerCall } from '@/lib/runtime/safe-server';

export default async function ProfilePage() {
  const profile = await safeServerCall('getCurrentProfile', () => getCurrentProfile(), null);

  return (
    <div className="space-y-4">
      <Card className="bg-[linear-gradient(135deg,#0f172a_0%,#111827_52%,#1e293b_100%)] text-white shadow-[0_28px_70px_rgba(15,23,42,0.24)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Profile hub</p>
        <h1 className="mt-2 max-w-4xl text-3xl font-bold sm:text-4xl">Tu identidad dentro de FlowTask</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
          Administra el nombre visible, la imagen del perfil y la contraseña de tu cuenta desde una página separada para mantener ajustes y perfil bien organizados.
        </p>
      </Card>

      <ProfileSettingsForm
        initialFullName={profile?.fullName ?? ''}
        email={profile?.email ?? ''}
        initialAvatarUrl={profile?.avatarUrl ?? ''}
      />
    </div>
  );
}
