import { supabase } from "@/lib/supabase";

const PAGE = 1000; // PostgREST's default hard cap per request.

/**
 * Fetch every row from a table, paging past PostgREST's 1000-row response cap.
 *
 * Without this, `.select("*")` silently returns only the first 1000 rows — for
 * the spells table (1000+ rows once seeded) that drops the highest levels.
 *
 * `build` applies ordering/filters to a fresh `select("*")` query each page;
 * `.range()` is appended here.
 */
export async function fetchAllRows<T>(
  table: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  build: (q: any) => any = (q) => q,
): Promise<{ data: T[]; error: string | null }> {
  const all: T[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await build(supabase.from(table).select("*")).range(
      from,
      from + PAGE - 1,
    );
    if (error) return { data: all, error: error.message };
    const rows = (data as T[]) ?? [];
    all.push(...rows);
    if (rows.length < PAGE) break;
    from += PAGE;
  }
  return { data: all, error: null };
}
