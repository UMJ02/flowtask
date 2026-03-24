import { getPublicSupabaseEnv } from "../src/lib/runtime/env";

function main() {
  const { url, anonKey } = getPublicSupabaseEnv();

  const checks = [
    { label: "NEXT_PUBLIC_SUPABASE_URL", ok: url.startsWith("http") },
    { label: "NEXT_PUBLIC_SUPABASE_ANON_KEY", ok: anonKey.length >= 10 },
  ];

  const failed = checks.filter((item) => !item.ok);

  if (failed.length) {
    console.error("[runtime-check] Falló la validación base de entorno:");
    failed.forEach((item) => console.error(`- ${item.label}`));
    process.exit(1);
  }

  console.log("[runtime-check] Entorno público de Supabase validado.");
}

main();
