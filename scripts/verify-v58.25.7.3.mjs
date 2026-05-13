#!/usr/bin/env node
import { spawnSync } from "node:child_process";
const result = spawnSync("node", ["scripts/verify-v58.25.7.3.1.mjs"], { stdio: "inherit" });
process.exit(result.status ?? 1);
