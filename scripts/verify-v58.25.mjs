#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };
const requireNotIncludes = (rel, text) => { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); };

const expectedVersion = "58.25-settings-hub-redesign";
const expectedRelease = "v58.25 Settings Hub Redesign";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.25");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.25") failures.push("verify:current must target verify:v58.25");
if ((pkg.scripts ?? {})["verify:v58.25"] !== "node scripts/verify-v58.25.mjs") failures.push("verify:v58.25 script must be available");

requireFile("scripts/verify-v58.25.mjs");
requireFile("docs/release/V58_25_SETTINGS_HUB_REDESIGN.md");
requireFile("docs/qa/FLOWTASK_V58_25_SETTINGS_HUB_REDESIGN_QA.md");
requireFile("src/components/settings/settings-footer.tsx");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.25");

requireIncludes("src/app/globals.css", "v58.25 — Settings Hub Redesign");
requireIncludes("src/app/globals.css", ".ft-settings-card");
requireIncludes("src/app/globals.css", ".ft-settings-shell");
requireIncludes("src/app/(app)/app/settings/page.tsx", "ft-settings-shell");
requireIncludes("src/app/(app)/app/settings/page.tsx", "SettingsFooter");
requireIncludes("src/components/settings/settings-account-overview.tsx", "Settings Hub");
requireIncludes("src/components/settings/settings-account-overview.tsx", "Cuenta, notificaciones y contexto de trabajo");
requireIncludes("src/components/settings/settings-account-overview.tsx", "bg-white");
requireNotIncludes("src/components/settings/settings-account-overview.tsx", "bg-[linear-gradient(135deg,#0f172a");
requireIncludes("src/components/settings/access-control-settings-card.tsx", "Permisos organización");
requireIncludes("src/components/settings/access-control-settings-card.tsx", "Permisos en tu plan");
requireIncludes("src/components/notifications/notification-preferences-form.tsx", "Entrega y frecuencia");
requireIncludes("src/components/settings/intelligent-attention-settings-card.tsx", "Asistente inteligente avanzado");
requireIncludes("src/components/settings/account-danger-zone.tsx", "Zona de peligro");

if (failures.length) {
  console.error("[verify:v58.25] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.25] OK — Settings Hub redesign aligned.");
