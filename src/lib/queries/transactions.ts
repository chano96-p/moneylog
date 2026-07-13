import { createClient } from "../supabase/server";
import type { TransactionWithCategory } from "../types";

export async function getTransactions() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transactions")
    .select("*, category:categories(name, icon, color)")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error("거래 내역을 불러오지 못했어요.");

  return (data ?? []) as TransactionWithCategory[];
}
