import { Card } from "@/components/ui/card";

export default function CompletedPage() {
  return (
    <Card>
      <h1 className="text-2xl font-bold text-slate-900">Tareas finalizadas</h1>
      <p className="mt-2 text-sm text-slate-500">Aquí se listarán las tareas con estado concluido.</p>
    </Card>
  );
}
