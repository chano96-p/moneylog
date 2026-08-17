import { currentMonthKST } from "../format";
import { createClient } from "../supabase/server";
import type { RecurringRuleWithCategory } from "../types";

const SELECT_WITH_CATEGORY = "*, category:categories(name, icon, color)";

export async function getRecurringRules(): Promise<
  RecurringRuleWithCategory[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recurring_rules")
    .select(SELECT_WITH_CATEGORY)
    .order("day_of_month", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("반복 거래를 불러오지 못했어요.", { cause: error });
  }

  return (data ?? []) as RecurringRuleWithCategory[];
}

/**
 * 이번 달 반복 거래를 아직 안 만들었으면 생성 (멱등).
 * 페이지 렌더 중 호출 — 같은 요청에서 생성 후 조회하므로 revalidate 불필요.
 * 실패해도 throw하지 않는다 — 부가 기능이 주요 화면을 막으면 안 되고,
 * 다음 방문 때 재시도되므로. 호출자는 false를 받아 배너로 알린다.
 */
export async function ensureRecurringGenerated(): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("materialize_recurring", {
    target_month: currentMonthKST(),
  });

  return !error;
}
