import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card>
      <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
      <p className="mt-2 text-sm text-slate-500">
        Aquí podrás agregar personalización del tablero, perfil, notificaciones y manejo de enlaces compartidos.
      </p>
    </Card>
  );
}
