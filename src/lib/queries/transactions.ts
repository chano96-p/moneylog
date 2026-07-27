import { endOfMonth, parse } from "date-fns";
import { toDateString } from "../format";
import { createClient } from "../supabase/server";
import type { TransactionWithCategory } from "../types";

const SELECT_WITH_CATEGORY = "*, category:categories(name, icon, color)";

/** month: 'YYYY-MM' */
export async function getTransactionsByMonth(month: string) {
  const start = parse(month, "yyyy-MM", new Date()); // 그 달 1일 (로컬)
  const end = endOfMonth(start);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transactions")
    .select(SELECT_WITH_CATEGORY)
    .gte("date", toDateString(start))
    .lte("date", toDateString(end))
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error("거래 내역을 불러오지 못했어요.");

  return (data ?? []) as TransactionWithCategory[];
}
