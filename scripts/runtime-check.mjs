import { loadEnvFiles } from "./load-env.mjs";

const loadedFrom = loadEnvFiles();
const requiredKeys = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];

const missing = requiredKeys.filter((key) => {
  const value = process.env[key];
  return !value || !value.trim();
});

function fail(messageLines) {
  for (const line of messageLines) {
    console.error(line);
  }
  process.exit(1);
}

if (missing.length > 0) {
  const lines = ["[runtime-check] Missing variables:"];
  for (const key of missing) lines.push(`- ${key}`);
  if (loadedFrom.length === 0) {
    lines.push("[runtime-check] No .env.local or .env file was found in the project root.");
  } else {
    lines.push(`[runtime-check] Loaded env files: ${loadedFrom.join(", ")}`);
  }
  fail(lines);
}

function decodeJwtPayload(token) {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function looksLikeUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function getSupabaseProjectRef(value) {
  try {
    const host = new URL(value).host;
    return host.endsWith(".supabase.co") ? host.split(".")[0] : null;
  } catch {
    return null;
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";

if (!looksLikeUrl(url)) {
  fail([
    "[runtime-check] NEXT_PUBLIC_SUPABASE_URL is not a valid URL.",
    `- Received: ${url || "<empty>"}`,
    "- Expected format: https://your-project.supabase.co",
  ]);
}

if (!url.includes(".supabase.co")) {
  console.warn("[runtime-check] Warning: NEXT_PUBLIC_SUPABASE_URL does not contain .supabase.co");
  console.warn("[runtime-check] If this is intentional (self-hosted Supabase), you can ignore this warning.");
}

const projectRef = getSupabaseProjectRef(url);
const anonPayload = decodeJwtPayload(anonKey);
if (!anonPayload) {
  console.warn("[runtime-check] Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY could not be decoded as a JWT.");
  console.warn("[runtime-check] If you are using the new opaque publishable key format, this warning is expected.");
}

if (anonPayload?.role === "service_role") {
  console.warn("[runtime-check] Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY looks like a service_role key.");
  console.warn("[runtime-check] Do not expose service_role keys in the browser; use the public anon/publishable key from Supabase Settings > API.");
}

if (serviceRoleKey) {
  const servicePayload = decodeJwtPayload(serviceRoleKey);

  if (!servicePayload) {
    console.warn("[runtime-check] Warning: SUPABASE_SERVICE_ROLE_KEY could not be decoded as a JWT.");
    console.warn("[runtime-check] If your Supabase project uses a non-JWT secret format, confirm it manually in Project Settings > API.");
  } else {
    if (servicePayload.role !== "service_role") {
      fail([
        "[runtime-check] SUPABASE_SERVICE_ROLE_KEY is not a service_role key.",
        `- Detected role: ${servicePayload.role || "<missing>"}`,
        "- Use the service_role key from the same Supabase project as NEXT_PUBLIC_SUPABASE_URL.",
      ]);
    }

    if (projectRef && servicePayload.ref && servicePayload.ref !== projectRef) {
      fail([
        "[runtime-check] SUPABASE_SERVICE_ROLE_KEY project ref does not match NEXT_PUBLIC_SUPABASE_URL.",
        `- URL project ref: ${projectRef}`,
        `- Key project ref: ${servicePayload.ref}`,
      ]);
    }
  }
}

console.log("[runtime-check] OK");
console.log(`[runtime-check] Loaded env files: ${loadedFrom.length > 0 ? loadedFrom.join(", ") : "none"}`);
for (const key of requiredKeys) {
  console.log(`- ${key}: present`);
}
console.log(`- SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? "present" : "not set"}`);
