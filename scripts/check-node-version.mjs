#!/usr/bin/env node
const requiredMajor = 20;
const current = process.versions.node || '';
const major = Number(current.split('.')[0] || 0);
if (major !== requiredMajor) {
  console.error(`[check-node-version] Node ${requiredMajor}.x recomendado. Actual: ${current}`);
  process.exit(1);
}
console.log(`[check-node-version] OK - Node ${current}`);
