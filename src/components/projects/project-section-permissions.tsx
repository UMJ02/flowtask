"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

const SECTIONS = [
  { key: "overview", label: "Resumen" },
  { key: "tasks", label: "Tareas" },
  { key: "comments", label: "Comentarios" },
  { key: "members", label: "Miembros" },
  { key: "files", label: "Adjuntos" },
  { key: "reports", label: "Reportes" },
] as const;

type MemberRow = {
  id: string;
  user_id: string;
  role: string;
  profiles?: { full_name?: string | null; email?: string | null } | { full_name?: string | null; email?: string | null }[] | null;
};

type PermissionRow = {
  id?: string;
  user_id: string;
  section_key: string;
  can_view: boolean;
  can_edit: boolean;
};

export function ProjectSectionPermissions({
  projectId,
  members,
  permissions,
}: {
  projectId: string;
  members: MemberRow[];
  permissions: PermissionRow[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getPermission = (userId: string, sectionKey: string) => {
    return permissions.find((item) => item.user_id === userId && item.section_key === sectionKey);
  };

  const savePermission = async (userId: string, sectionKey: string, canView: boolean, canEdit: boolean) => {
    setError(null);
    setSavingKey(`${userId}-${sectionKey}`);
    const current = getPermission(userId, sectionKey);

    const payload = {
      project_id: projectId,
      user_id: userId,
      section_key: sectionKey,
      can_view: canView,
      can_edit: canEdit,
    };

    const query = current?.id
      ? supabase.from("project_section_permissions").update(payload).eq("id", current.id)
      : supabase.from("project_section_permissions").insert(payload);

    const { error: queryError } = await query;
    if (queryError) {
      setError(queryError.message);
      setSavingKey(null);
      return;
    }

    setSavingKey(null);
    router.refresh();
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900">Permisos por sección</h3>
      <p className="mt-1 text-sm text-slate-500">
        Define qué partes del proyecto puede revisar o editar cada colaborador. Útil cuando jefatura solo necesita lectura y el equipo operativo sí puede gestionar tareas.
      </p>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-3 py-2">Colaborador</th>
              <th className="px-3 py-2">Sección</th>
              <th className="px-3 py-2">Ver</th>
              <th className="px-3 py-2">Editar</th>
              <th className="px-3 py-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {members.filter((member) => member.role !== "owner").flatMap((member) => {
              const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
              return SECTIONS.map((section) => {
                const current = getPermission(member.user_id, section.key);
                const canView = current?.can_view ?? true;
                const canEdit = current?.can_edit ?? member.role === "editor";
                const rowKey = `${member.user_id}-${section.key}`;
                return (
                  <tr key={rowKey} className="border-b border-slate-100 align-top">
                    <td className="px-3 py-3">
                      <p className="font-medium text-slate-900">{profile?.full_name || profile?.email || "Usuario"}</p>
                      <p className="text-xs text-slate-500">{profile?.email || member.role}</p>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{section.label}</td>
                    <td className="px-3 py-3">
                      <input type="checkbox" defaultChecked={canView} id={`view-${rowKey}`} className="h-4 w-4 rounded border-slate-300" />
                    </td>
                    <td className="px-3 py-3">
                      <input type="checkbox" defaultChecked={canEdit} id={`edit-${rowKey}`} className="h-4 w-4 rounded border-slate-300" />
                    </td>
                    <td className="px-3 py-3">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={savingKey === rowKey}
                        onClick={() => {
                          const viewInput = document.getElementById(`view-${rowKey}`) as HTMLInputElement | null;
                          const editInput = document.getElementById(`edit-${rowKey}`) as HTMLInputElement | null;
                          savePermission(member.user_id, section.key, !!viewInput?.checked, !!editInput?.checked);
                        }}
                      >
                        {savingKey === rowKey ? "Guardando..." : "Guardar"}
                      </Button>
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
