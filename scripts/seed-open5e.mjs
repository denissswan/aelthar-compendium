/**
 * Seed the `spells` table from the Open5e API.
 *
 * Usage:
 *   node scripts/seed-open5e.mjs
 * If you hit a TLS error (UNABLE_TO_VERIFY_LEAF_SIGNATURE):
 *   NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/seed-open5e.mjs
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (bypasses RLS for the upsert)
 *
 * Needs a UNIQUE constraint on spells.name for upsert (see
 * supabase/migrations/0003_compendium_seed.sql).
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

const START_URL = "https://api.open5e.com/v1/spells/?limit=500&format=json";
const BATCH_SIZE = 50;

/** Fetch every page, following the API's `next` link until null. */
async function fetchAll(startUrl) {
  const all = [];
  let url = startUrl;
  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Запит не вдався (${res.status}): ${url}`);
    const json = await res.json();
    all.push(...(json.results ?? []));
    console.log(`  …завантажено ${all.length} записів`);
    // Stop early if a page returned fewer than the page size and has no next.
    url = json.next || null;
  }
  return all;
}

function formatSpell(spell) {
  return {
    name: spell.name,
    level: spell.level_int, // 0 = заговір
    school: spell.school,
    casting_time: spell.casting_time,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: spell.desc,
    higher_levels: spell.higher_level || null,
    classes: spell.dnd_class, // "Wizard, Sorcerer"
    source: spell.document__title || "SRD",
  };
}

/** Keep the last row per name so a single upsert batch never hits one name twice. */
function dedupeByName(rows) {
  const map = new Map();
  for (const r of rows) if (r.name) map.set(r.name, r);
  return [...map.values()];
}

async function main() {
  console.log("Завантаження заклинань з Open5e…");
  const raw = await fetchAll(START_URL);
  const rows = dedupeByName(raw.map(formatSpell));
  const total = rows.length;
  console.log(`Готую до імпорту ${total} заклинань.`);

  let done = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("spells")
      .upsert(batch, { onConflict: "name" });
    if (error) throw new Error(`Помилка upsert: ${error.message}`);
    done += batch.length;
    console.log(`Імпортовано ${done} / ${total} заклинань`);
  }
  console.log("✅ Заклинання імпортовано.");
}

main().catch((e) => {
  console.error("✖", e.message);
  process.exit(1);
});
