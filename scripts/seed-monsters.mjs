/**
 * Seed the `monsters` table from the Open5e API.
 *
 * Usage:
 *   node scripts/seed-monsters.mjs
 * TLS workaround if needed:
 *   NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/seed-monsters.mjs
 *
 * Requires the monsters table + UNIQUE(name) — run
 * supabase/migrations/0003_compendium_seed.sql first.
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
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

const START_URL = "https://api.open5e.com/v1/monsters/?limit=500&format=json";
const BATCH_SIZE = 50;

// Standard 5e CR → XP, used when the API doesn't supply xp directly.
const CR_XP = {
  "0": 10, "1/8": 25, "1/4": 50, "1/2": 100,
  "1": 200, "2": 450, "3": 700, "4": 1100, "5": 1800,
  "6": 2300, "7": 2900, "8": 3900, "9": 5000, "10": 5900,
  "11": 7200, "12": 8400, "13": 10000, "14": 11500, "15": 13000,
  "16": 15000, "17": 18000, "18": 20000, "19": 22000, "20": 25000,
  "21": 33000, "22": 41000, "23": 50000, "24": 62000, "25": 75000,
  "26": 90000, "27": 105000, "28": 120000, "29": 135000, "30": 155000,
};

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

const fmtMod = (n) => (n >= 0 ? `+${n}` : `${n}`);

/** Coerce Open5e string/array/object fields into a flat text value. */
function asText(v) {
  if (v == null || v === "") return null;
  if (Array.isArray(v)) {
    const parts = v
      .map((x) => (typeof x === "string" ? x : x?.name ?? null))
      .filter(Boolean);
    return parts.length ? parts.join(", ") : null;
  }
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

/** Open5e v1 speed is an object like { walk: 30, fly: 60 }. */
function formatSpeed(speed) {
  if (!speed) return null;
  if (typeof speed === "string") return speed;
  const parts = Object.entries(speed)
    .filter(([, v]) => v != null && v !== false)
    .map(([k, v]) => (k === "walk" ? `${v} ft.` : `${k} ${v} ft.`));
  return parts.length ? parts.join(", ") : null;
}

function formatSaves(m) {
  const order = [
    ["strength_save", "STR"],
    ["dexterity_save", "DEX"],
    ["constitution_save", "CON"],
    ["intelligence_save", "INT"],
    ["wisdom_save", "WIS"],
    ["charisma_save", "CHA"],
  ];
  const parts = order
    .filter(([k]) => m[k] != null)
    .map(([k, lab]) => `${lab} ${fmtMod(m[k])}`);
  return parts.length ? parts.join(", ") : null;
}

function formatSkills(skills) {
  if (!skills || typeof skills !== "object") return null;
  const parts = Object.entries(skills).map(
    ([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)} ${fmtMod(v)}`,
  );
  return parts.length ? parts.join(", ") : null;
}

function formatMonster(m) {
  const cr = m.challenge_rating ?? (m.cr != null ? String(m.cr) : null);
  return {
    name: m.name,
    size: m.size ?? null,
    type: m.type ?? null,
    subtype: m.subtype || null,
    alignment: m.alignment ?? null,
    armor_class: typeof m.armor_class === "number" ? m.armor_class : null,
    hit_points: typeof m.hit_points === "number" ? m.hit_points : null,
    hit_dice: m.hit_dice ?? null,
    speed: formatSpeed(m.speed),
    str: m.strength ?? null,
    dex: m.dexterity ?? null,
    con: m.constitution ?? null,
    int: m.intelligence ?? null,
    wis: m.wisdom ?? null,
    cha: m.charisma ?? null,
    saving_throws: formatSaves(m),
    skills: formatSkills(m.skills),
    damage_resistances: asText(m.damage_resistances),
    damage_immunities: asText(m.damage_immunities),
    condition_immunities: asText(m.condition_immunities),
    senses: asText(m.senses),
    languages: asText(m.languages),
    challenge_rating: cr,
    xp: typeof m.xp === "number" ? m.xp : (cr != null ? CR_XP[cr] ?? null : null),
    special_abilities: m.special_abilities ?? null,
    actions: m.actions ?? null,
    legendary_actions: m.legendary_actions ?? null,
    source: m.document__title || "SRD",
  };
}

function dedupeByName(rows) {
  const map = new Map();
  for (const r of rows) if (r.name) map.set(r.name, r);
  return [...map.values()];
}

async function main() {
  console.log("Завантаження монстрів з Open5e…");
  const raw = await fetchAll(START_URL);
  const rows = dedupeByName(raw.map(formatMonster));
  const total = rows.length;
  console.log(`Готую до імпорту ${total} монстрів.`);

  let done = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from("monsters")
      .upsert(batch, { onConflict: "name" });
    if (error) throw new Error(`Помилка upsert: ${error.message}`);
    done += batch.length;
    console.log(`Імпортовано ${done} / ${total} монстрів`);
  }
  console.log("✅ Монстрів імпортовано.");
}

main().catch((e) => {
  console.error("✖", e.message);
  process.exit(1);
});
