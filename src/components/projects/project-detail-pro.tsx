import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Flag,
  MoreVertical,
  Plus,
  Share2,
  Sparkles,
  Star,
  TimerReset,
  Users,
} from "lucide-react";
import { ActivityItem } from "@/lib/queries/activity";
import { projectEditRoute, taskDetailRoute } from "@/lib/navigation/routes";
import { formatDate } from "@/lib/utils/dates";

const cardClass = "rounded-[24px] border border-[#E5EAF1] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)]";

type ProjectDetailProProps = {
  project: any;
  tasks: any[];
  members: any[];
  attachments: any[];
  activity: ActivityItem[];
  currentQuery?: string;
  canCreateTask?: boolean;
  createTaskHref: string;
};

function statusLabel(value?: string | null) {
  const map: Record<string, string> = {
    activo: "En progreso",
    en_pausa: "En pausa",
    completado: "Completado",
    vencido: "Vencido",
    en_proceso: "En progreso",
    en_espera: "En espera",
    concluido: "Completada",
  };
  return map[value ?? ""] ?? "Por iniciar";
}

function statusClass(value?: string | null) {
  if (value === "concluido" || value === "completado") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (value === "en_espera" || value === "en_pausa") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (value === "vencido") return "bg-rose-50 text-rose-700 ring-rose-200";
  if (value === "activo" || value === "en_proceso") return "bg-blue-50 text-blue-700 ring-blue-200";
  return "bg-slate-50 text-slate-700 ring-slate-200";
}

function priorityLabel(value?: string | null) {
  const map: Record<string, string> = { alta: "Alta", media: "Media", baja: "Baja" };
  return map[value ?? ""] ?? "Media";
}

function priorityClass(value?: string | null) {
  if (value === "alta") return "bg-rose-50 text-rose-700 ring-rose-200";
  if (value === "baja") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function profileFrom(member: any) {
  return Array.isArray(member?.profiles) ? member.profiles[0] : member?.profiles;
}

function initials(name?: string | null) {
  const clean = (name ?? "Usuario").trim();
  const parts = clean.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("") || "U";
}

function roleLabel(role?: string | null) {
  const map: Record<string, string> = {
    owner: "Líder",
    editor: "Miembro",
    viewer: "Viewer",
    admin: "Admin",
  };
  return map[role ?? ""] ?? "Miembro";
}

function formatFileSize(value?: number | null) {
  const size = Number(value ?? 0);
  if (!size) return "—";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function attachmentIcon(fileName?: string | null) {
  const name = (fileName ?? "").toLowerCase();
  if (name.endsWith(".xls") || name.endsWith(".xlsx") || name.endsWith(".csv")) return <FileSpreadsheet className="h-4 w-4" />;
  if (name.endsWith(".zip") || name.endsWith(".rar")) return <FileArchive className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

function activityCopy(item: ActivityItem) {
  const action = item.action.replaceAll("_", " ");
  const title = typeof item.metadata?.title === "string" ? item.metadata.title : null;
  const name = typeof item.metadata?.name === "string" ? item.metadata.name : null;
  return title || name ? `${action}: ${title ?? name}` : action;
}

function ProjectStatsRow({ tasks }: { tasks: any[] }) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "concluido").length;
  const progress = tasks.filter((task) => task.status === "en_proceso").length;
  const waiting = tasks.filter((task) => task.status === "en_espera").length;
  const overdue = tasks.filter((task) => task.due_date && new Date(`${task.due_date}T23:59:59`) < new Date() && task.status !== "concluido").length;
  const items = [
    { label: "Total de tareas", value: total, helper: "tareas creadas", icon: Sparkles, tone: "bg-violet-50 text-violet-700" },
    { label: "Completadas", value: completed, helper: total ? `${Math.round((completed / Math.max(total, 1)) * 100)}% del total` : "sin avance", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700" },
    { label: "En progreso", value: progress, helper: "trabajo activo", icon: ArrowRight, tone: "bg-blue-50 text-blue-700" },
    { label: "En espera", value: waiting, helper: "pendientes", icon: TimerReset, tone: "bg-amber-50 text-amber-700" },
    { label: "Atrasadas", value: overdue, helper: "requieren atención", icon: Flag, tone: "bg-rose-50 text-rose-700" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className={`${cardClass} flex items-center gap-4 px-5 py-5`}>
            <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${item.tone}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-[#64748B]">{item.label}</p>
              <p className="mt-1 text-2xl font-black text-[#0F172A]">{item.value}</p>
              <p className="text-xs font-medium text-[#64748B]">{item.helper}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProjectHeroCard({ project, tasks, currentQuery }: { project: any; tasks: any[]; currentQuery: string }) {
  const completed = tasks.filter((task) => task.status === "concluido").length;
  const progress = tasks.length ? Math.round((completed / Math.max(tasks.length, 1)) * 100) : project.status === "completado" ? 100 : 65;
  const department = Array.isArray(project.departments) ? project.departments[0] : project.departments;

  return (
    <section className={`${cardClass} p-4 md:p-5`}>
      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_360px] lg:items-center">
        <div className="relative h-44 overflow-hidden rounded-[20px] bg-slate-100 lg:h-48">
          <Image src="/imagenes/organization-team-hero.png" alt="Proyecto FlowTask" fill className="object-cover" sizes="220px" priority={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
              <Users className="h-3.5 w-3.5" />
              {project.is_collaborative ? "Colaborativo" : "Individual"}
            </span>
            {department?.name ? <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">{department.name}</span> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-[#0F172A] md:text-3xl">{project.title}</h1>
            <Star className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-2 text-sm font-medium text-[#64748B]">Creado el {project.created_at ? formatDate(project.created_at) : "—"}</p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[#64748B]">{project.description || "Proyecto activo del workspace. Centraliza tareas, equipo, archivos y seguimiento operativo en un solo lugar."}</p>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
            <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[#E5EAF1] bg-white px-4 text-sm font-bold text-[#334155] shadow-[0_8px_20px_rgba(15,23,42,0.035)] transition hover:bg-slate-50">
              <Share2 className="h-4 w-4" />
              Compartir
            </button>
            <Link href={projectEditRoute(project.id, currentQuery)} className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#050B18] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(5,11,24,0.18)] transition hover:-translate-y-0.5">
              <MoreVertical className="h-4 w-4" />
              Más opciones
            </Link>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-[#64748B]">Progreso general</span>
              <span className="text-xl font-black text-[#16A66F]">{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-[#16C784]" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs font-semibold text-[#64748B]">Fecha límite</p>
              <p className="mt-2 inline-flex items-center gap-1.5 font-black text-[#0F172A]"><CalendarDays className="h-4 w-4 text-[#64748B]" />{project.due_date ? formatDate(project.due_date) : "Sin fecha"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#64748B]">Estado</p>
              <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusClass(project.status)}`}>{statusLabel(project.status)}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#64748B]">Prioridad</p>
              <span className="mt-2 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">Media</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectTabs() {
  const tabs = ["Resumen", "Tareas", "Cronograma", "Equipo", "Archivos", "Actividad", "Configuración"];
  return (
    <div className="flex gap-7 overflow-x-auto border-b border-[#E5EAF1] px-1">
      {tabs.map((tab, index) => (
        <button key={tab} type="button" className={`relative whitespace-nowrap pb-3 text-sm font-bold ${index === 0 ? "text-[#16A66F]" : "text-[#64748B] hover:text-[#0F172A]"}`}>
          {tab}
          {index === 0 ? <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#16C784]" /> : null}
        </button>
      ))}
    </div>
  );
}

function RecentTasksCard({ tasks }: { tasks: any[] }) {
  const visibleTasks = tasks.slice(0, 5);
  return (
    <section className={`${cardClass} p-5`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-[#0F172A]">Tareas recientes</h2>
      </div>
      <div className="divide-y divide-[#EEF2F7]">
        {visibleTasks.length ? visibleTasks.map((task) => (
          <div key={task.id} className="grid gap-3 py-4 text-sm md:grid-cols-[28px_minmax(0,1.5fr)_120px_140px_110px_90px_40px] md:items-center">
            <span className={`hidden h-4 w-4 rounded border md:inline-flex ${task.status === "concluido" ? "border-[#16C784] bg-[#16C784]" : "border-slate-300 bg-white"}`}>{task.status === "concluido" ? <CheckCircle2 className="h-3.5 w-3.5 text-white" /> : null}</span>
            <Link href={taskDetailRoute(task.id)} className="min-w-0">
              <p className="truncate font-black text-[#0F172A]">{task.title}</p>
              <p className="mt-1 truncate text-xs font-medium text-[#64748B]">{task.client_name || "Sin cliente"}</p>
            </Link>
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusClass(task.status)}`}>{statusLabel(task.status)}</span>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#475569]">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-600">UM</span>
              Responsable
            </div>
            <span className="text-xs font-bold text-[#64748B]">{task.due_date ? formatDate(task.due_date) : "Sin fecha"}</span>
            <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${priorityClass(task.priority)}`}>{priorityLabel(task.priority)}</span>
            <Link href={taskDetailRoute(task.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5EAF1] text-[#64748B] hover:bg-slate-50"><MoreVertical className="h-4 w-4" /></Link>
          </div>
        )) : (
          <p className="py-6 text-sm font-medium text-[#64748B]">Todavía no hay tareas asociadas a este proyecto.</p>
        )}
      </div>
      <div className="mt-4 flex justify-center">
        <Link href="/app/tasks" className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-[#E5EAF1] bg-white px-5 text-sm font-bold text-[#334155] transition hover:bg-slate-50">
          Ver todas las tareas
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function ProjectMembersCard({ members }: { members: any[] }) {
  return (
    <section className={`${cardClass} p-5`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-[#0F172A]">Miembros del proyecto</h2>
        <button type="button" className="inline-flex h-9 items-center gap-1 rounded-[12px] border border-[#E5EAF1] bg-white px-3 text-xs font-bold text-[#475569] hover:bg-slate-50"><Plus className="h-4 w-4" />Invitar</button>
      </div>
      <div className="space-y-4">
        {members.length ? members.slice(0, 6).map((member) => {
          const profile = profileFrom(member);
          const name = profile?.full_name || profile?.email || "Usuario";
          return (
            <div key={member.id} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                  {initials(name)}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#16C784]" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[#0F172A]">{name}</p>
                  <p className="truncate text-xs font-medium text-[#64748B]">{member.role === "owner" ? "Líder del proyecto" : roleLabel(member.role)}</p>
                </div>
              </div>
              <span className="rounded-full border border-[#E5EAF1] bg-white px-3 py-1 text-xs font-bold text-[#64748B]">{roleLabel(member.role)}</span>
            </div>
          );
        }) : <p className="text-sm font-medium text-[#64748B]">Todavía no hay colaboradores agregados.</p>}
      </div>
    </section>
  );
}

function RecentFilesCard({ attachments }: { attachments: any[] }) {
  return (
    <section className={`${cardClass} p-5`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-[#0F172A]">Archivos recientes</h2>
        <button type="button" className="inline-flex h-9 items-center rounded-[12px] border border-[#E5EAF1] bg-white px-3 text-xs font-bold text-[#475569] hover:bg-slate-50">Ver todo</button>
      </div>
      <div className="space-y-3">
        {attachments.length ? attachments.slice(0, 4).map((file) => (
          <a key={file.id} href={file.public_url || "#"} className="flex items-center justify-between gap-3 rounded-[16px] p-2 transition hover:bg-slate-50">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-rose-50 text-rose-600">{attachmentIcon(file.file_name)}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-black text-[#334155]">{file.file_name || "Archivo"}</span>
              <span className="block truncate text-xs font-medium text-[#64748B]">{formatFileSize(file.file_size)} · {file.created_at ? formatDate(file.created_at) : "Sin fecha"}</span>
            </span>
            <MoreVertical className="h-4 w-4 text-[#64748B]" />
          </a>
        )) : <p className="text-sm font-medium text-[#64748B]">Sin archivos recientes.</p>}
      </div>
    </section>
  );
}

function ProjectActivityCard({ activity }: { activity: ActivityItem[] }) {
  return (
    <section className={`${cardClass} p-5`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-[#0F172A]">Actividad reciente</h2>
        <button type="button" className="inline-flex h-9 items-center rounded-[12px] border border-[#E5EAF1] bg-white px-3 text-xs font-bold text-[#475569] hover:bg-slate-50">Ver toda la actividad</button>
      </div>
      <div className="space-y-4">
        {activity.length ? activity.slice(0, 3).map((item) => (
          <div key={item.id} className="flex gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-700 ring-1 ring-slate-200">FT</span>
            <div>
              <p className="text-sm font-bold text-[#334155]">{activityCopy(item)}</p>
              <p className="mt-1 text-xs font-medium text-[#64748B]">{item.created_at ? formatDate(item.created_at) : "Ahora"}</p>
            </div>
          </div>
        )) : <p className="text-sm font-medium text-[#64748B]">Sin actividad reciente para mostrar.</p>}
      </div>
    </section>
  );
}

export function ProjectDetailPro({ project, tasks, members, attachments, activity, currentQuery = "", createTaskHref, canCreateTask = false }: ProjectDetailProProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#64748B]">
        <Link href="/app/projects" className="transition hover:text-[#0F172A]">Proyectos</Link>
        <span>›</span>
        <span className="text-[#0F172A]">{project.title}</span>
      </div>

      <ProjectHeroCard project={project} tasks={tasks} currentQuery={currentQuery} />
      <ProjectStatsRow tasks={tasks} />
      <ProjectTabs />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <RecentTasksCard tasks={tasks} />
          <ProjectActivityCard activity={activity} />
        </div>
        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <div className={`${cardClass} p-5`}>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#64748B]">Acción rápida</p>
            <h3 className="mt-2 text-lg font-black text-[#0F172A]">Crear tarea vinculada</h3>
            <p className="mt-1 text-sm leading-6 text-[#64748B]">Abre una nueva tarea ya conectada con este proyecto para mantener el flujo limpio.</p>
            <Link href={createTaskHref} aria-disabled={!canCreateTask} className={`mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[14px] text-sm font-black ${canCreateTask ? "bg-[#16C784] text-white shadow-[0_12px_24px_rgba(22,199,132,0.22)]" : "pointer-events-none bg-slate-100 text-slate-400"}`}>
              <Plus className="h-4 w-4" />
              Nueva tarea vinculada
            </Link>
          </div>
          <ProjectMembersCard members={members} />
          <RecentFilesCard attachments={attachments} />
        </aside>
      </div>
    </div>
  );
}
