import { endOfMonth, format, parse, subMonths } from "date-fns";
import { currentMonthKST, toDateString } from "../format";
import { createClient } from "../supabase/server";
import type { TransactionType, TransactionWithCategory } from "../types";

const SELECT_WITH_CATEGORY = "*, category:categories(name, icon, color)";

export type MonthlyTotal = {
  month: string;
  total: number;
};

/** 최근 N개월 지출 합계 — 빈 달은 0으로 채워 항상 N개를 반환 */
export async function getMonthlyTotals({
  count = 12,
  baseMonth,
  type = "expense",
}: {
  count?: number;
  baseMonth?: string;
  type?: TransactionType;
} = {}): Promise<MonthlyTotal[]> {
  const base = parse(baseMonth ?? currentMonthKST(), "yyyy-MM", new Date());
  const startMonth = format(subMonths(base, count - 1), "yyyy-MM");
  const endMonth = format(base, "yyyy-MM");

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("monthly_totals", {
    start_month: startMonth,
    end_month: endMonth,
    txn_type: type,
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

/** 검색어가 있으면 전체 기간, 없으면 해당 월만. categoryId는 양쪽 모두에 적용 */
export async function getTransactionsByMonth(
  month: string,
  search?: string,
  categoryId?: string,
): Promise<TransactionWithCategory[]> {
  const supabase = await createClient();

  let query = supabase.from("transactions").select(SELECT_WITH_CATEGORY);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (search) {
    // %와 _는 ilike 와일드카드 → 리터럴로 쓰려면 이스케이프
    const escaped = search.replace(/[%_\\]/g, "\\$&");
    query = query.ilike("memo", `%${escaped}%`).limit(101);
  } else {
    const start = parse(month, "yyyy-MM", new Date());
    query = query
      .gte("date", toDateString(start))
      .lte("date", toDateString(endOfMonth(start)));
  }

  const { data, error } = await query
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("거래 내역을 불러오지 못했어요.", { cause: error });
  }

  return (data ?? []) as TransactionWithCategory[];
}

export type CategoryTotalRow = {
  /** null = 미분류 */
  category_id: string | null;
  total: number;
};

/** 기간 카테고리별 합계 — SQL 집계 (1년치 거래를 앱으로 가져오지 않기 위해) */
export async function getCategoryTotals({
  startMonth,
  endMonth,
  type,
}: {
  startMonth: string;
  endMonth: string;
  type: TransactionType;
}): Promise<CategoryTotalRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("category_totals", {
    start_month: startMonth,
    end_month: endMonth,
    txn_type: type,
  });

  if (error) {
    throw new Error("카테고리별 합계를 불러오지 못했어요.", { cause: error });
  }

  return data ?? [];
}
