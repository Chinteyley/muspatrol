import { writeFileSync, statSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function dirSize(path: string): number {
  let total = 0;
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const full = resolve(path, entry.name);
    if (entry.isDirectory()) total += dirSize(full);
    else total += statSync(full).size;
  }
  return total;
}

const dist = resolve(ROOT, "dist");
const samples = resolve(ROOT, "public/samples");
const report = {
  measuredAt: new Date().toISOString(),
  host: "Cursor Cloud Agent VM, x86_64, Node " + process.version,
  distBytes: dirSize(dist),
  sampleBytes: dirSize(samples),
};
writeFileSync(resolve(ROOT, "eval/bundle-size.json"), JSON.stringify(report, null, 2));
console.log(report);
