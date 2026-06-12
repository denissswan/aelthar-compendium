/**
 * Translate ONLY the `name` column of the spells table to Ukrainian, via Claude.
 *
 *   node scripts/translate-spell-names.mjs            # translate
 *   node scripts/translate-spell-names.mjs --dry-run  # just count what would change
 *
 * Idempotent: names that already contain Cyrillic are skipped, so re-running is
 * safe and only picks up newly-added English spells.
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (bypasses RLS for the update)
 *   ANTHROPIC_API_KEY           (https://platform.claude.com → API keys)
 *
 * Joins (character_spells) reference spells by id, not name, so renaming is safe.
 */
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SERVICE_KEY || !ANTHROPIC_KEY) {
  console.error(
    "✖ Відсутні змінні середовища. Потрібні NEXT_PUBLIC_SUPABASE_URL, " +
      "SUPABASE_SERVICE_ROLE_KEY та ANTHROPIC_API_KEY у .env.local",
  );
  process.exit(1);
}

const DRY_RUN = process.argv.includes("--dry-run");
const BATCH_SIZE = 50;
const MODEL = "claude-opus-4-8";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

const hasCyrillic = (s) => /[Ѐ-ӿ]/.test(s);

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["translations"],
  properties: {
    translations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["en", "uk"],
        properties: {
          en: { type: "string" },
          uk: { type: "string" },
        },
      },
    },
  },
};

/** Fetch every spell (id + name), paging past the 1000-row cap. */
async function fetchAllSpells() {
  const all = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("spells")
      .select("id, name")
      .order("name", { ascending: true })
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    all.push(...(data ?? []));
    if (!data || data.length < 1000) break;
    from += 1000;
  }
  return all;
}

/** Translate a batch of English names → Ukrainian, returned as an en→uk map. */
async function translateBatch(names) {
  const msg = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    output_config: { format: { type: "json_schema", schema: SCHEMA } },
    messages: [
      {
        role: "user",
        content:
          "Translate these Dungeons & Dragons 5e spell names into natural, " +
          "concise Ukrainian as used in fantasy/RPG settings. Keep proper " +
          "nouns (e.g. character or place names like Tasha, Bigby, Mordenkainen) " +
          "transliterated, translate the descriptive part. Return every name.\n\n" +
          names.map((n) => `- ${n}`).join("\n"),
      },
    ],
  });

  const text = msg.content.find((b) => b.type === "text")?.text ?? "{}";
  const parsed = JSON.parse(text);
  const map = new Map();
  for (const t of parsed.translations ?? []) {
    if (t.en && t.uk) map.set(t.en, t.uk);
  }
  return map;
}

async function main() {
  console.log("Завантаження заклять…");
  const spells = await fetchAllSpells();
  const todo = spells.filter((s) => s.name && !hasCyrillic(s.name));
  console.log(
    `Усього ${spells.length} заклять; до перекладу ${todo.length} ` +
      `(решта вже українською).`,
  );

  if (DRY_RUN) {
    console.log("— режим --dry-run, нічого не змінюю.");
    return;
  }
  if (todo.length === 0) {
    console.log("✅ Усі назви вже українською.");
    return;
  }

  let done = 0;
  for (let i = 0; i < todo.length; i += BATCH_SIZE) {
    const batch = todo.slice(i, i + BATCH_SIZE);
    const map = await translateBatch(batch.map((s) => s.name));

    for (const spell of batch) {
      const uk = map.get(spell.name);
      if (!uk || uk === spell.name) continue;
      const { error } = await supabase
        .from("spells")
        .update({ name: uk })
        .eq("id", spell.id);
      if (error) throw new Error(`Помилка оновлення "${spell.name}": ${error.message}`);
    }
    done += batch.length;
    console.log(`Перекладено ${done} / ${todo.length} назв`);
  }
  console.log("✅ Назви заклять перекладено українською.");
}

main().catch((e) => {
  console.error("✖", e.message);
  process.exit(1);
});
