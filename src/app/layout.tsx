import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/pwa/pwa-register";

export function generateMetadata(): Metadata {
  const enableManifest = process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "production";

  return {
    title: "FlowTask",
    description: "Workspace para tareas, proyectos y operación.",
    manifest: enableManifest ? "/manifest.webmanifest" : undefined,
    applicationName: "FlowTask",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "FlowTask",
    },
    icons: {
      apple: "/icons/icon-192.png",
      icon: [
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#10b981",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
