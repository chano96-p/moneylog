import { createClient } from "../supabase/server";
import type { Category } from "../types";

export async function getCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at");

  if (error) {
    throw new Error("카테고리를 불러오지 못했어요.", { cause: error });
  }

  return (data ?? []) as Category[];
}

export async function getTransactionCountByCategory(categoryIds: string[]) {
  if (categoryIds.length === 0) return new Map<string, number>();

  const supabase = await createClient();

  // 카테고리별로 count만 조회 — head: true면 행 데이터 없이 개수만 옴
  const results = await Promise.all(
    categoryIds.map(async (id) => {
      const { count, error } = await supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .eq("category_id", id);

      if (error)
        throw new Error("거래 수를 불러오지 못했어요.", { cause: error });
      return [id, count ?? 0] as const;
    }),
  );

  return new Map(results);
}
