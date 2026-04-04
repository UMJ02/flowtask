#!/usr/bin/env node
const preferredMajor = 20;
const allowedMajors = new Set([20, 22]);
const current = process.versions.node || '';
const major = Number(current.split('.')[0] || 0);

if (!allowedMajors.has(major)) {
  console.error(`[check-node-version] Node ${preferredMajor}.x recomendado. Actual no soportado: ${current}`);
  process.exit(1);
}

if (major !== preferredMajor) {
  console.warn(`[check-node-version] Node ${preferredMajor}.x recomendado para deploy. Actual permitido para desarrollo: ${current}`);
  process.exit(0);
}

console.log(`[check-node-version] OK - Node ${current}`);
