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
