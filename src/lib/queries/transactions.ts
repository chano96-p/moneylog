import { endOfMonth, format, parse, subMonths } from "date-fns";
import { currentMonthKST, toDateString } from "../format";
import { createClient } from "../supabase/server";
import type { TransactionWithCategory } from "../types";

const SELECT_WITH_CATEGORY = "*, category:categories(name, icon, color)";

export type MonthlyTotal = { month: string; total: number };

/** 최근 N개월 지출 합계 — 빈 달은 0으로 채워 항상 N개를 반환 */
export async function getMonthlyExpenseTotals(
  count = 12,
  baseMonth?: string,
): Promise<MonthlyTotal[]> {
  const base = parse(baseMonth ?? currentMonthKST(), "yyyy-MM", new Date());
  const startMonth = format(subMonths(base, count - 1), "yyyy-MM");
  const endMonth = format(base, "yyyy-MM");

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("monthly_expense_totals", {
    start_month: startMonth,
    end_month: endMonth,
  });

  if (error) {
    throw new Error("월별 지출을 불러오지 못했어요.", { cause: error });
  }

  // SQL은 거래가 있는 달만 돌려줌(희소) → 빈 달을 0으로 채움(조밀)
  const byMonth = new Map((data ?? []).map((r) => [r.month, r.total]));

  return Array.from({ length: count }, (_, i) => {
    const month = format(subMonths(base, count - 1 - i), "yyyy-MM");
    return { month, total: byMonth.get(month) ?? 0 };
  });
}

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

  if (error) {
    throw new Error("거래 내역을 불러오지 못했어요.", { cause: error });
  }

  return (data ?? []) as TransactionWithCategory[];
}
