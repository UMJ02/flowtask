import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Building2,
  ClipboardList,
  CreditCard,
  FolderKanban,
  LayoutGrid,
  Settings,
  Shield,
  Users,
  BrainCircuit,
  LifeBuoy,
  ShieldEllipsis,
  PanelsTopLeft,
} from 'lucide-react';
import type { AppRoute } from '@/lib/navigation/routes';

export type AppNavLink = {
  href: AppRoute;
  label: string;
  hint: string;
  icon: LucideIcon;
  isNotifications?: boolean;
};

export const appNavLinks: AppNavLink[] = [
  { href: '/app/dashboard', label: 'Workspace', hint: 'Tu tablero', icon: LayoutGrid },
  { href: '/app/pizarra', label: 'Pizarra', hint: 'Paneles y notas', icon: PanelsTopLeft },
  { href: '/app/projects', label: 'Proyectos', hint: 'Fechas y avance', icon: FolderKanban },
  { href: '/app/tasks', label: 'Tareas', hint: 'Pendientes al día', icon: ClipboardList },
  { href: '/app/clients', label: 'Clientes', hint: 'Cuentas activas', icon: Users },
  { href: '/app/intelligence', label: 'Insights', hint: 'Riesgo y foco', icon: BrainCircuit },
  { href: '/app/reports', label: 'Reportes', hint: 'Resumen y PDF', icon: BarChart3 },
  { href: '/app/organization', label: 'Equipo', hint: 'Miembros y espacio', icon: Building2 },
  { href: '/app/organization/roles', label: 'Roles', hint: 'Accesos', icon: Shield },
  { href: '/app/organization/billing', label: 'Plan', hint: 'Límites', icon: CreditCard },
  { href: '/app/organization/support', label: 'Soporte', hint: 'Mesa interna', icon: LifeBuoy },
  { href: '/app/platform', label: 'Platform', hint: 'SaaS ops', icon: ShieldEllipsis },
  { href: '/app/settings', label: 'Ajustes', hint: 'Perfil y preferencias', icon: Settings },
];
