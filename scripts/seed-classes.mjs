/**
 * Seed the `classes` table from the Open5e API.
 *   node scripts/seed-classes.mjs
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 * and the classes table with UNIQUE(name) (migration 0004).
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

const START_URL = "https://api.open5e.com/v1/classes/?limit=500&format=json";
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

function formatClass(c) {
  const proficiencies = [
    c.prof_armor && `Броня: ${c.prof_armor}`,
    c.prof_weapons && `Зброя: ${c.prof_weapons}`,
    c.prof_tools && `Інструменти: ${c.prof_tools}`,
    c.prof_skills && `Навички: ${c.prof_skills}`,
  ]
    .filter(Boolean)
    .join("\n");
  return {
    name: c.name,
    hit_die: c.hit_die != null ? String(c.hit_die) : null,
    description: c.desc || null,
    proficiencies: proficiencies || null,
    saving_throws: c.prof_saving_throws || null,
    spellcasting_ability: c.spellcasting_ability || null,
    source: c.document__title || "SRD",
  };
}

function dedupeByName(rows) {
  const map = new Map();
  for (const r of rows) if (r.name) map.set(r.name, r);
  return [...map.values()];
}

async function main() {
  console.log("Завантаження класів з Open5e…");
  const rows = dedupeByName((await fetchAll(START_URL)).map(formatClass));
  const total = rows.length;
  console.log(`Готую до імпорту ${total} класів.`);

  let done = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("classes")
      .upsert(batch, { onConflict: "name" });
    if (error) throw new Error(`Помилка upsert: ${error.message}`);
    done += batch.length;
    console.log(`Імпортовано ${done} / ${total} класів`);
  }
  console.log("✅ Класи імпортовано.");
}

main().catch((e) => {
  console.error("✖", e.message);
  process.exit(1);
});
