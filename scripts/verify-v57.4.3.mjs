import { existsSync, readFileSync } from "node:fs";
const required = [
  "src/components/layout/app-footer.tsx",
  "src/lib/release/version.ts",
  "docs/release/V57_4_3_DELIVERY_NOTES.md",
];
for (const file of required) {
  if (!existsSync(file)) {
    console.error(`Missing: ${file}`);
    process.exit(1);
  }
}
const footer = readFileSync("src/components/layout/app-footer.tsx", "utf8");
if (!footer.includes("canvasgraficacr") || !footer.includes("Facebook") || !footer.includes("Instagram") || !footer.includes("Youtube")) {
  console.error("Footer content validation failed");
  process.exit(1);
}
console.log("verify-v57.4.3 OK");
