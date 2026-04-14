import { Card } from '@/components/ui/card';
import type { ClientPermissionSummary } from '@/types/organization';

export function ClientPermissionsPanel({
  items,
  canManage = false,
  embedded = false,
}: {
  items: ClientPermissionSummary[];
  canManage?: boolean;
  embedded?: boolean;
}) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Permisos por cliente</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Acceso efectivo del usuario actual</h2>
          <p className="mt-1 text-sm text-slate-600">Esta tabla muestra únicamente los permisos asignados al usuario autenticado dentro de la organización activa.</p>
        </div>
        {canManage ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Puedes administrarlos</span> : null}
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="pb-2 pr-4 font-medium">Cliente</th>
              <th className="pb-2 pr-4 font-medium">Ver</th>
              <th className="pb-2 pr-4 font-medium">Editar</th>
              <th className="pb-2 pr-4 font-medium">Miembros</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? items.map((item) => (
              <tr key={item.clientName} className="border-t border-slate-100">
                <td className="py-3 pr-4 font-medium text-slate-900">{item.clientName}</td>
                <td className="py-3 pr-4 text-slate-600">{item.canView ? 'Sí' : 'No'}</td>
                <td className="py-3 pr-4 text-slate-600">{item.canEdit ? 'Sí' : 'No'}</td>
                <td className="py-3 pr-4 text-slate-600">{item.canManageMembers ? 'Sí' : 'No'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-6 text-sm text-slate-500">No hay permisos por cliente asignados directamente a tu usuario en esta organización.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  return embedded ? content : <Card>{content}</Card>;
}
