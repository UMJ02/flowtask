import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Flag,
  MoreVertical,
  Plus,
  Sparkles,
  Star,
  TimerReset,
  Users,
} from "lucide-react";
import { ActivityItem } from "@/lib/queries/activity";
import { projectEditRoute } from "@/lib/navigation/routes";
import { formatDate } from "@/lib/utils/dates";
import { CopyCurrentUrlButton } from "@/components/ui/copy-current-url-button";
import { ProjectPlanningTimeline } from "@/components/projects/project-planning-timeline";
import { ProjectInlineTasks } from "@/components/projects/project-inline-tasks";
import { ProjectHeroInlineEditor } from "@/components/projects/project-hero-inline-editor";

const projectUi = {
  card: "rounded-[24px] border border-[#E7EDF5] bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)]",
  smallCard: "rounded-[22px] border border-[#E7EDF5] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]",
  buttonDark: "inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[#050B18] px-6 text-sm font-bold text-white shadow-[0_12px_28px_rgba(5,11,24,0.18)] transition hover:-translate-y-0.5 hover:bg-[#111827]",
  buttonGhost: "inline-flex h-12 items-center justify-center gap-2 rounded-[16px] border border-[#E7EDF5] bg-white px-5 text-sm font-bold text-[#0F172A] transition hover:bg-[#F8FAFC]",
  eyebrow: "text-xs font-black uppercase tracking-[0.22em] text-[#16A36C]",
};

type ProjectDetailProProps = {
  project: any;
  tasks: any[];
  members: any[];
  attachments: any[];
  activity: ActivityItem[];
  currentQuery?: string;
  canCreateTask?: boolean;
  canEdit?: boolean;
  editMode?: boolean;
  createTaskHref?: string;
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
  if (value === "concluido" || value === "completado") return "bg-[#ECFDF5] text-[#087A4B] ring-[#BBF7D0]";
  if (value === "en_espera" || value === "en_pausa") return "bg-[#FFF8E8] text-[#B45309] ring-[#FDECC8]";
  if (value === "vencido") return "bg-[#FFF1F2] text-[#E11D48] ring-[#FFE4E6]";
  if (value === "activo" || value === "en_proceso") return "bg-[#EFF6FF] text-[#2563EB] ring-[#BFDBFE]";
  return "bg-slate-50 text-slate-700 ring-slate-200";
}

function priorityLabel(value?: string | null) {
  const map: Record<string, string> = { alta: "Alta", media: "Media", baja: "Baja" };
  return map[value ?? ""] ?? "Media";
}

function priorityClass(value?: string | null) {
  if (value === "alta") return "bg-[#FFF1F2] text-[#E11D48] ring-[#FFE4E6]";
  if (value === "baja") return "bg-[#ECFDF5] text-[#087A4B] ring-[#BBF7D0]";
  return "bg-[#FFF8E8] text-[#B45309] ring-[#FDECC8]";
}

function profileFrom(member: any) {
  return Array.isArray(member?.profiles) ? member.profiles[0] : member?.profiles;
}

function initials(name?: string | null) {
  const clean = (name ?? "Usuario").trim();
  const parts = clean.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("") || "U";
}

function memberName(member: any) {
  const profile = profileFrom(member);
  return profile?.full_name || profile?.email || "Miembro";
}

function roleLabel(role?: string | null) {
  const map: Record<string, string> = { owner: "Líder", editor: "Miembro", viewer: "Viewer", admin: "Admin" };
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

function isImageAttachment(file: any) {
  return Boolean(file?.public_url && file?.mime_type?.startsWith?.("image/"));
}

const projectActivityLabels: Record<string, string> = {
  project_updated: "Proyecto actualizado",
  project_status_changed: "Estado del proyecto actualizado",
  project_task_added: "Nueva tarea interna creada",
  project_task_updated: "Tarea interna actualizada",
  project_task_completed: "Tarea interna completada",
  project_task_deleted: "Tarea interna eliminada",
  project_file_uploaded: "Archivo subido al proyecto",
  attachment_uploaded: "Archivo subido al proyecto",
  project_member_added: "Miembro agregado al proyecto",
  project_view_saved: "Vista guardada",
};

function activityCopy(item: ActivityItem) {
  const label = projectActivityLabels[item.action] ?? "Actividad registrada";
  const title = typeof item.metadata?.title === "string" ? item.metadata.title : null;
  const name = typeof item.metadata?.name === "string" ? item.metadata.name : null;
  const fileName = typeof item.metadata?.file_name === "string" ? item.metadata.file_name : null;
  const suffix = title ?? name ?? fileName;
  return suffix ? `${label}: ${suffix}` : label;
}

function projectProgress(tasks: any[], projectStatus?: string | null) {
  if (!tasks.length) return projectStatus === "completado" ? 100 : 0;
  const completed = tasks.filter((task) => task.status === "concluido" || task.status === "completado").length;
  return Math.round((completed / Math.max(tasks.length, 1)) * 100);
}

function AvatarStack({ members }: { members: any[] }) {
  const visible = members.slice(0, 5);
  if (!visible.length) return null;
  return (
    <div className="mt-4 flex items-center gap-3">
      <div className="flex -space-x-2">
        {visible.map((member) => {
          const name = memberName(member);
          return (
            <span key={member.id ?? member.user_id} className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-[#ECFDF5] text-[11px] font-black text-[#087A4B] shadow-sm">
              {initials(name)}
            </span>
          );
        })}
      </div>
      <span className="text-xs font-bold text-[#64748B]">{members.length} en el equipo</span>
    </div>
  );
}

function ProjectStatsRow({ tasks }: { tasks: any[] }) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "concluido" || task.status === "completado").length;
  const progress = tasks.filter((task) => task.status === "en_proceso").length;
  const waiting = tasks.filter((task) => task.status === "en_espera").length;
  const overdue = tasks.filter((task) => task.due_date && new Date(`${task.due_date}T23:59:59`) < new Date() && task.status !== "concluido" && task.status !== "completado").length;
  const items = [
    { label: "Total de tareas", value: total, helper: "creadas", icon: Sparkles, tone: "bg-[#F6F0FF] text-[#7C3AED]" },
    { label: "Completadas", value: completed, helper: total ? `${Math.round((completed / Math.max(total, 1)) * 100)}% del total` : "sin avance", icon: CheckCircle2, tone: "bg-[#ECFDF5] text-[#16A36C]" },
    { label: "En progreso", value: progress, helper: "trabajo activo", icon: ArrowRight, tone: "bg-[#EFF6FF] text-[#3B82F6]" },
    { label: "En espera", value: waiting, helper: "pendientes", icon: TimerReset, tone: "bg-[#FFF8E8] text-[#F59E0B]" },
    { label: "Atrasadas", value: overdue, helper: "requieren atención", icon: Flag, tone: "bg-[#FFF1F2] text-[#EF4444]" },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <article key={item.label} className="rounded-[22px] border border-[#E7EDF5] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5">
            <div className="flex items-center gap-4">
              <span className={`grid h-12 w-12 place-items-center rounded-full ${item.tone}`}><Icon className="h-5 w-5" /></span>
              <div>
                <p className="text-sm font-semibold text-[#64748B]">{item.label}</p>
                <p className="mt-1 text-[30px] font-black leading-none text-[#0F172A]">{item.value}</p>
                <p className="mt-1 text-sm text-[#64748B]">{item.helper}</p>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function ProjectHeroCard({ project, tasks, members, currentQuery }: { project: any; tasks: any[]; members: any[]; currentQuery: string }) {
  const progress = projectProgress(tasks, project.status);
  const department = Array.isArray(project.departments) ? project.departments[0] : project.departments;
  const cover = project.image_url || "/imagenes/organization-team-hero.png";

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[#E7EDF5] bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
      <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#ECFDF5] via-[#EFF6FF]/50 to-transparent" />
      <div className="pointer-events-none absolute right-6 top-6 h-[78%] w-[34%] rounded-[28px] bg-[radial-gradient(circle_at_1px_1px,rgba(22,199,132,0.13)_1px,transparent_0)] [background-size:14px_14px] opacity-70" />
      <div className="relative grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)_360px]">
        <div className="relative h-[190px] overflow-hidden rounded-[20px] bg-slate-100">
          <Image src={cover} alt={project.title || "Proyecto FlowTask"} fill className="object-cover" sizes="230px" priority={false} unoptimized={Boolean(project.image_url)} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
        </div>

        <div className="flex min-w-0 flex-col justify-center">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-black text-[#087A4B] ring-1 ring-[#BBF7D0]">{project.is_collaborative ? "Colaborativo" : "Individual"}</span>
            <span className="rounded-full bg-[#F6F0FF] px-3 py-1 text-xs font-black text-[#7C3AED] ring-1 ring-[#E9D5FF]">{department?.name || project.country || "Proyecto"}</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <h1 className="text-[34px] font-black leading-tight tracking-[-0.035em] text-[#0F172A]">{project.title}</h1>
            <Star className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-2 text-sm font-semibold text-[#64748B]">Creado el {project.created_at ? formatDate(project.created_at) : "—"}</p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#64748B]">{project.description || "Proyecto activo. Centraliza tareas, equipo, archivos y seguimiento en un solo lugar."}</p>
          <AvatarStack members={members} />
        </div>

        <div className="flex flex-col justify-between gap-6">
          <div className="flex justify-start gap-3 lg:justify-end">
            <CopyCurrentUrlButton label="Compartir" className={projectUi.buttonGhost} />
            <Link href={projectEditRoute(project.id, currentQuery)} className={projectUi.buttonDark}><MoreVertical className="h-4 w-4" />Editar proyecto</Link>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-[#64748B]">Progreso general</span>
              <span className="text-2xl font-black text-[#16A36C]">{progress}%</span>
            </div>
            <div className="h-[7px] rounded-full bg-[#EEF2F7]"><div className="h-[7px] rounded-full bg-[#16C784]" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-xs font-bold text-[#64748B]">Fecha límite</p><p className="mt-2 inline-flex items-center gap-1.5 font-black text-[#0F172A]"><CalendarDays className="h-4 w-4 text-[#64748B]" />{project.due_date ? formatDate(project.due_date) : "Sin fecha"}</p></div>
            <div><p className="text-xs font-bold text-[#64748B]">Estado</p><span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(project.status)}`}>{statusLabel(project.status)}</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectTabs() {
  const tabs = [
    { label: "Resumen", href: "#resumen" },
    { label: "Tareas", href: "#tareas" },
    { label: "Planificación", href: "#timeline" },
    { label: "Equipo", href: "#equipo" },
    { label: "Archivos", href: "#archivos" },
    { label: "Actividad", href: "#actividad" },
  ];
  return (
    <nav className="flex h-14 items-center gap-8 overflow-x-auto border-b border-[#E7EDF5]">
      {tabs.map((tab, index) => (
        <a key={tab.label} href={tab.href} data-active={index === 0} className="relative h-14 shrink-0 text-sm font-black text-[#64748B] transition hover:text-[#0F172A] data-[active=true]:text-[#16A36C] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-[#16C784] after:opacity-0 data-[active=true]:after:opacity-100">
          {tab.label}
        </a>
      ))}
    </nav>
  );
}

function ProjectMembersCard({ members }: { members: any[] }) {
  return (
    <section id="equipo" className={`${projectUi.smallCard} scroll-mt-28`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-[#0F172A]">Miembros del proyecto</h2>
        <Link href="/app/organization/roles" className="inline-flex h-9 items-center gap-1 rounded-[12px] border border-[#E7EDF5] bg-white px-3 text-xs font-black text-[#475569] hover:bg-slate-50"><Plus className="h-4 w-4" />Invitar</Link>
      </div>
      <div className="space-y-4">
        {members.length ? members.slice(0, 6).map((member) => {
          const name = memberName(member);
          return (
            <div key={member.id ?? member.user_id} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ECFDF5] text-xs font-black text-[#087A4B] ring-1 ring-[#BBF7D0]">{initials(name)}<span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#16C784]" /></span>
                <div className="min-w-0"><p className="truncate text-sm font-black text-[#0F172A]">{name}</p><p className="truncate text-xs font-medium text-[#64748B]">{member.role === "owner" ? "Líder del proyecto" : roleLabel(member.role)}</p></div>
              </div>
              <span className="rounded-full border border-[#E7EDF5] bg-white px-3 py-1 text-xs font-black text-[#64748B]">{roleLabel(member.role)}</span>
            </div>
          );
        }) : <p className="text-sm font-medium text-[#64748B]">Aún no hay personas agregadas al proyecto.</p>}
      </div>
    </section>
  );
}

function RecentFilesCard({ attachments }: { attachments: any[] }) {
  return (
    <section id="archivos" className={`${projectUi.smallCard} scroll-mt-28`}>
      <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-black text-[#0F172A]">Archivos recientes</h2><a href="#archivos" className="inline-flex h-9 items-center rounded-[12px] border border-[#E7EDF5] bg-white px-3 text-xs font-black text-[#475569] hover:bg-slate-50">Ver todo</a></div>
      <div className="grid grid-cols-2 gap-3">
        {attachments.length ? attachments.slice(0, 4).map((file) => (
          <a key={file.id} href={file.public_url || "#"} className="group overflow-hidden rounded-[16px] border border-[#E7EDF5] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(15,23,42,0.07)]">
            <span className="grid aspect-square place-items-center overflow-hidden bg-[#F8FAFC] text-[#64748B]">
              {isImageAttachment(file) ? <img src={file.public_url} alt={file.file_name || "Archivo"} className="h-full w-full object-cover" /> : attachmentIcon(file.file_name)}
            </span>
            <span className="block min-w-0 p-2"><span className="block truncate text-xs font-black text-[#334155]">{file.file_name || "Archivo"}</span><span className="block truncate text-[11px] font-medium text-[#64748B]">{formatFileSize(file.file_size)}</span></span>
          </a>
        )) : <p className="col-span-2 text-sm font-medium text-[#64748B]">Sin archivos recientes.</p>}
      </div>
    </section>
  );
}

function ProjectActivityCard({ activity }: { activity: ActivityItem[] }) {
  return (
    <section id="actividad" className={`${projectUi.card} scroll-mt-28 p-6`}>
      <div className="mb-5 flex items-center justify-between gap-3"><div><p className={projectUi.eyebrow}>Actividad reciente</p><h2 className="mt-2 text-2xl font-black text-[#0F172A]">Movimientos del proyecto</h2></div><a href="#actividad" className="inline-flex h-10 items-center rounded-[14px] border border-[#E7EDF5] bg-white px-4 text-xs font-black text-[#475569] hover:bg-slate-50">Ver movimientos</a></div>
      <div className="space-y-4">
        {activity.length ? activity.slice(0, 5).map((item) => (
          <div key={item.id} className="flex gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F6F0FF] text-xs font-black text-[#7C3AED] ring-1 ring-[#E9D5FF]">FT</span>
            <div><p className="text-sm font-bold text-[#334155]">{activityCopy(item)}</p><p className="mt-1 text-xs font-medium text-[#64748B]">{item.created_at ? formatDate(item.created_at) : "Ahora"}</p></div>
          </div>
        )) : <p className="text-sm font-medium text-[#64748B]">Aún no hay actividad para mostrar.</p>}
      </div>
    </section>
  );
}

export function ProjectDetailPro({ project, tasks, members, attachments, activity, currentQuery = "", canCreateTask = false, canEdit = false, editMode = false }: ProjectDetailProProps) {
  const progress = projectProgress(tasks, project.status);
  return (
    <div id="resumen" className="mx-auto max-w-[1440px] space-y-6 px-4 py-5 text-[#0F172A] sm:px-6 lg:px-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm font-black text-[#64748B]">
        <Link href="/app/projects" className="transition hover:text-[#0F172A]">Proyectos</Link><span>›</span><span className="text-[#0F172A]">{project.title}</span>
      </nav>
      {editMode && canEdit ? (
        <ProjectHeroInlineEditor project={project} progress={progress} currentQuery={currentQuery.replace(/(^|&)mode=edit(&|$)/, "$1").replace(/&$/, "")} />
      ) : (
        <ProjectHeroCard project={project} tasks={tasks} members={members} currentQuery={currentQuery} />
      )}
      <ProjectStatsRow tasks={tasks} />
      <ProjectTabs />
      <ProjectPlanningTimeline project={project} tasks={tasks} currentQuery={currentQuery} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6"><ProjectInlineTasks project={project} initialTasks={tasks} members={members} canManage={canCreateTask} /><ProjectActivityCard activity={activity} /></section>
        <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-[24px] border border-[#BBF7D0] bg-[#ECFDF5] p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-black uppercase tracking-[0.20em] text-[#087A4B]">Acción rápida</p>
            <h3 className="mt-2 text-xl font-black text-[#0F172A]">Crear tarea interna</h3>
            <p className="mt-2 text-sm leading-6 text-[#64748B]">Agrega tareas dentro de este proyecto sin salir de esta vista.</p>
            <a href="#tareas" className={`mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[16px] text-sm font-black ${canCreateTask ? "bg-[#16C784] text-white shadow-[0_12px_24px_rgba(22,199,132,0.22)]" : "pointer-events-none bg-white/70 text-slate-400"}`}><Plus className="h-4 w-4" />Ir a tareas del proyecto</a>
          </section>
          <ProjectMembersCard members={members} />
          <RecentFilesCard attachments={attachments} />
        </aside>
      </div>
    </div>
  );
}
