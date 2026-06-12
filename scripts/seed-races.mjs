/**
 * Seed the `races` table from the Open5e API.
 *   node scripts/seed-races.mjs
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 * and the races table with UNIQUE(name) (migration 0004).
 */
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "✖ Відсутні змінні середовища. Потрібні NEXT_PUBLIC_SUPABASE_URL та " +
      "SUPABASE_SERVICE_ROLE_KEY у .env.local",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const START_URL = "https://api.open5e.com/v1/races/?limit=500&format=json";
const BATCH_SIZE = 50;

async function fetchAll(startUrl) {
  const all = [];
  let url = startUrl;
  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Запит не вдався (${res.status}): ${url}`);
    const json = await res.json();
    all.push(...(json.results ?? []));
    console.log(`  …завантажено ${all.length} записів`);
    url = json.next || null;
  }
  return all;
}

function formatRace(race) {
  const description = [race.desc, race.traits].filter(Boolean).join("\n\n");
  return {
    name: race.name,
    region: null, // Aelthar lore fields — fill in later if desired
    church_relation: null,
    description: description || null,
    source: race.document__title || "SRD",
  };
}

function dedupeByName(rows) {
  const map = new Map();
  for (const r of rows) if (r.name) map.set(r.name, r);
  return [...map.values()];
}

async function main() {
  console.log("Завантаження рас з Open5e…");
  const rows = dedupeByName((await fetchAll(START_URL)).map(formatRace));
  const total = rows.length;
  console.log(`Готую до імпорту ${total} рас.`);

  let done = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("races")
      .upsert(batch, { onConflict: "name" });
    if (error) throw new Error(`Помилка upsert: ${error.message}`);
    done += batch.length;
    console.log(`Імпортовано ${done} / ${total} рас`);
  }
  console.log("✅ Раси імпортовано.");
}

main().catch((e) => {
  console.error("✖", e.message);
  process.exit(1);
});
