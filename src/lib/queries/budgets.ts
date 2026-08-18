import type { Budget } from "@/lib/types";
import { createClient } from "../supabase/server";

/** month: 'YYYY-MM' */
export async function getBudgetsByMonth(month: string): Promise<Budget[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("month", month);

  if (error) {
    throw new Error("예산을 불러오지 못했어요.", { cause: error });
  }

  return data ?? [];
}

/** 월 총예산 — 미설정이면 null */
export async function getMonthlyBudget(month: string): Promise<number | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("monthly_budgets")
    .select("amount")
    .eq("month", month)
    .maybeSingle();

  if (error) {
    throw new Error("총예산을 불러오지 못했어요.", { cause: error });
  }

  return data?.amount ?? null;
}
