import { Card } from "@/components/ui/card";

export function UpcomingItems() {
  const items = [
    "Revisión de propuesta comercial · mañana",
    "Entrega de campaña digital · 2 días",
    "Validación con finanzas · 3 días",
  ];

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">Por vencer</h2>
      <ul className="mt-4 space-y-3 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}
