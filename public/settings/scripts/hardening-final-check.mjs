#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const nextConfig = fs.readFileSync(path.join(root, 'next.config.ts'), 'utf8');
const vercelConfig = fs.readFileSync(path.join(root, 'vercel.json'), 'utf8');
const gitignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'public', 'sw.js'), 'utf8');

const checks = [
  ['next poweredByHeader disabled', nextConfig.includes('poweredByHeader: false')],
  ['next reactStrictMode enabled', nextConfig.includes('reactStrictMode: true')],
  ['next compression enabled', nextConfig.includes('compress: true')],
  ['next optimizePackageImports lucide-react', nextConfig.includes('optimizePackageImports') && nextConfig.includes('lucide-react')],
  ['vercel permissions policy header', vercelConfig.includes('Permissions-Policy')],
  ['vercel service worker cache rule', vercelConfig.includes('"/sw.js"')],
  ['gitignore blocks env.local', gitignore.includes('.env.local')],
  ['gitignore blocks .next', gitignore.includes('.next')],
  ['service worker cache name bumped v58.8', sw.includes('flowtask-v58-8')],
];

let failures = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures += 1;
}

if (failures > 0) {
  console.error(`\n[hardening-final-check] Completed with ${failures} failing checks.`);
  process.exit(1);
}

console.log('\n[hardening-final-check] OK');
