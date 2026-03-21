import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowTask",
  description: "Gestor web de tareas y proyectos colaborativos con Supabase.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
