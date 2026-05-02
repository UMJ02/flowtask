import { AuthPremiumLoader } from '@/components/ui/auth-premium-loader';

export default function LoginLoading() {
  return <AuthPremiumLoader title="Preparando acceso…" description="Estamos dejando el login listo para entrar." />;
}
