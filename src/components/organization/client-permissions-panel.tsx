'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
  const [open, setOpen] = useState(true);

  const content = (
    <div>
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-3 text-left transition hover:bg-slate-100">
        <div>
          <p className="text-sm font-semibold text-slate-900">Permisos por cliente</p>
          <p className="mt-1 text-sm text-slate-600">Consulta rápido qué accesos tienes dentro de esta organización.</p>
        </div>
        <div className="flex items-center gap-2">
          {canManage ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">Puedes administrarlos</span> : null}
          <ChevronDown className={`h-4 w-4 text-slate-500 transition ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open ? (
        <div className="mt-3 overflow-x-auto">
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
                  <td colSpan={4} className="py-6 text-sm text-slate-500">Todavía no tienes permisos por cliente asignados directamente en esta organización.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );

  return embedded ? content : <Card>{content}</Card>;
}
