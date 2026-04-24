
import type { LucideIcon } from 'lucide-react';
import {
  ClipboardList,
  FolderKanban,
  LayoutGrid,
  Settings,
  Users,
  Bell,
  Building2,
  ShieldAlert,
  BarChart3,
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
  { href: '/app/projects', label: 'Proyectos', hint: 'Fechas y avance', icon: FolderKanban },
  { href: '/app/tasks', label: 'Tareas', hint: 'Pendientes al día', icon: ClipboardList },
  { href: '/app/analytics', label: 'Analytics', hint: 'Salud y escala', icon: BarChart3 },
  { href: '/app/clients', label: 'Registros', hint: 'Clientes, departamentos y países', icon: Users },
  { href: '/app/organization', label: 'Equipo', hint: 'Miembros y roles', icon: Building2 },
  { href: '/app/notifications', label: 'Notificaciones', hint: 'Alertas y seguimiento', icon: Bell, isNotifications: true },
  { href: '/app/support', label: 'Soporte', hint: 'Incidencias y observabilidad', icon: ShieldAlert },
  { href: '/app/settings', label: 'Ajustes', hint: 'Avisos y workspace', icon: Settings },
];
