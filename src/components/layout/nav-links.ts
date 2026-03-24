import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Bell,
  BrainCircuit,
  Building2,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FolderKanban,
  LayoutGrid,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import type { AppRoute } from '@/lib/navigation/routes';
import {
  calendarRoute,
  intelligenceRoute,
  organizationBillingRoute,
  organizationRolesRoute,
  organizationRoute,
  notificationsRoute,
  projectListRoute,
  remindersRoute,
  reportsRoute,
  settingsRoute,
  taskListRoute,
  workspaceRoute,
  clientListRoute,
} from '@/lib/navigation/routes';

export type AppNavSection = 'core' | 'organization' | 'utility';

export type AppNavLink = {
  href: AppRoute;
  label: string;
  hint: string;
  icon: LucideIcon;
  section: AppNavSection;
  isNotifications?: boolean;
};

export const appNavLinks: AppNavLink[] = [
  { href: workspaceRoute(), label: 'Workspace', hint: 'Centro operativo', icon: LayoutGrid, section: 'core' },
  { href: projectListRoute(), label: 'Proyectos', hint: 'Entrega y avance', icon: FolderKanban, section: 'core' },
  { href: taskListRoute(), label: 'Tareas', hint: 'Trabajo del día', icon: ClipboardList, section: 'core' },
  { href: clientListRoute(), label: 'Clientes', hint: 'Cuentas y carga', icon: Users, section: 'core' },
  { href: intelligenceRoute(), label: 'Intelligence', hint: 'Plan, riesgo y ejecución', icon: BrainCircuit, section: 'core' },
  { href: reportsRoute(), label: 'Reportes', hint: 'Resumen y exportación', icon: BarChart3, section: 'core' },
  { href: organizationRoute(), label: 'Equipo', hint: 'Miembros y espacio', icon: Building2, section: 'organization' },
  { href: organizationRolesRoute(), label: 'Roles', hint: 'Accesos y permisos', icon: Shield, section: 'organization' },
  { href: organizationBillingRoute(), label: 'Plan', hint: 'Límites y consumo', icon: CreditCard, section: 'organization' },
  { href: settingsRoute(), label: 'Ajustes', hint: 'Perfil y preferencias', icon: Settings, section: 'organization' },
  { href: notificationsRoute(), label: 'Notificaciones', hint: 'Alertas y actividad', icon: Bell, section: 'utility', isNotifications: true },
  { href: remindersRoute(), label: 'Recordatorios', hint: 'Pendientes y follow-up', icon: ClipboardList, section: 'utility' },
  { href: calendarRoute(), label: 'Calendario', hint: 'Agenda operativa', icon: CalendarDays, section: 'utility' },
];

export const coreNavLinks = appNavLinks.filter((link) => link.section === 'core');
export const organizationNavLinks = appNavLinks.filter((link) => link.section === 'organization');
export const utilityNavLinks = appNavLinks.filter((link) => link.section === 'utility');
