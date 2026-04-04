#!/usr/bin/env node
const current = process.versions.node || "";
const major = Number(current.split(".")[0] || 0);
const allowed = new Set([20, 22]);
if (!allowed.has(major)) {
  console.error(`[check-node-version] Node 20.x para deploy y 22.x para desarrollo están soportados. Actual: ${current}`);
  process.exit(1);
}
if (major === 20) {
  console.log(`[check-node-version] OK - Node ${current}`);
} else {
  console.log(`[check-node-version] OK - Node ${current} (compatible para desarrollo local; deploy recomendado en Node 20.x)`);
}
