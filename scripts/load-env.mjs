#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseEnvFile(content) {
  const parsed = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const normalized = line.startsWith('export ') ? line.slice(7).trim() : line;
    const separatorIndex = normalized.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = normalized.slice(0, separatorIndex).trim();
    if (!key) continue;

    const value = stripWrappingQuotes(normalized.slice(separatorIndex + 1).trim());
    parsed[key] = value;
  }

  return parsed;
}

export function loadEnvFiles(options = {}) {
  const {
    cwd = process.cwd(),
    files = ['.env.local', '.env'],
    override = false,
  } = options;

  const loadedFrom = [];

  for (const file of files) {
    const fullPath = path.join(cwd, file);
    if (!fs.existsSync(fullPath)) continue;

    const parsed = parseEnvFile(fs.readFileSync(fullPath, 'utf8'));
    for (const [key, value] of Object.entries(parsed)) {
      if (override || !(key in process.env) || process.env[key] === '') {
        process.env[key] = value;
      }
    }
    loadedFrom.push(file);
  }

  return loadedFrom;
}
