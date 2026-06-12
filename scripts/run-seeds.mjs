/**
 * Run all seed scripts sequentially.
 *   npm run seed
 * Passes the current environment through, so the TLS workaround propagates:
 *   NODE_TLS_REJECT_UNAUTHORIZED=0 npm run seed
 */
import { spawnSync } from "node:child_process";
import process from "node:process";

const scripts = [
  "scripts/seed-open5e.mjs",
  "scripts/seed-monsters.mjs",
  "scripts/seed-races.mjs",
  "scripts/seed-classes.mjs",
];

for (const script of scripts) {
  console.log(`\n▶ ${script}`);
  const result = spawnSync(process.execPath, [script], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    console.error(`✖ ${script} завершився з кодом ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

console.log("\n✅ Усі сіди виконано.");
