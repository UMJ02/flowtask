import fs from "fs";

const packageJson = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const releaseVersion = fs.readFileSync(new URL("../src/lib/release/version.ts", import.meta.url), "utf8");
const readme = fs.readFileSync(new URL("../README.md", import.meta.url), "utf8");

const expectedVersion = "58.11.9-premium-finish-and-radar-refine";
const expectedRelease = "v58.11.9 Premium Finish and Radar Refine";

if (packageJson.version !== expectedVersion) {
  throw new Error(`[verify-v58.11.9] package.json version mismatch: ${packageJson.version}`);
}

if (!releaseVersion.includes(expectedVersion) || !releaseVersion.includes(expectedRelease)) {
  throw new Error("[verify-v58.11.9] src/lib/release/version.ts is not aligned.");
}

if (!readme.includes("V58.11.9")) {
  throw new Error("[verify-v58.11.9] README does not mention V58.11.9.");
}

console.log("[verify-v58.11.9] OK — premium visual finish, denser modern UI primitives and compact radar refinement on top of V58.11.8.");
