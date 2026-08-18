"use server";

import { format, parse, subMonths } from "date-fns";
import {
  type MonthlyBudgetInput,
  monthlyBudgetSchema,
  monthSchema,
} from "../schemas";
import { createClient } from "../supabase/server";
import { revalidateAll } from "./revalidate";

/** 총예산 upsert — null이면 해제 */
export async function saveMonthlyBudget(input: MonthlyBudgetInput) {
  const { month, amount } = monthlyBudgetSchema.parse(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  if (amount === null) {
    const { error } = await supabase
      .from("monthly_budgets")
      .delete()
      .eq("month", month);

    if (error) {
      throw new Error("총예산을 해제하지 못했어요.", { cause: error });
    }
  } else {
    const { error } = await supabase
      .from("monthly_budgets")
      .upsert(
        { user_id: user.id, month, amount },
        { onConflict: "user_id,month" },
      );

    if (error) {
      throw new Error("총예산을 저장하지 못했어요.", { cause: error });
    }
  }

  revalidateAll();
}

/**
 * 전월 예산(카테고리별 + 총예산)을 해당 월로 복사.
 * 채움 시맨틱 — 이미 설정된 항목은 덮어쓰지 않는다.
 * 전월에 예산이 없는 건 에러가 아니라 정보 → copied: false로 반환.
 */
export async function copyBudgetsFromPreviousMonth(
  input: string,
): Promise<{ copied: boolean }> {
  const toMonth = monthSchema.parse(input);
  const fromMonth = format(
    subMonths(parse(toMonth, "yyyy-MM", new Date()), 1),
    "yyyy-MM",
  );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const [{ data: prevBudgets }, { data: prevTotal }] = await Promise.all([
    supabase
      .from("budgets")
      .select("category_id, amount")
      .eq("month", fromMonth),
    supabase
      .from("monthly_budgets")
      .select("amount")
      .eq("month", fromMonth)
      .maybeSingle(),
  ]);

  if (!prevBudgets?.length && !prevTotal) {
    return { copied: false };
  }

  if (prevBudgets?.length) {
    const { error } = await supabase.from("budgets").upsert(
      prevBudgets.map((b) => ({
        user_id: user.id,
        category_id: b.category_id,
        month: toMonth,
        amount: b.amount,
      })),
      { onConflict: "user_id,category_id,month", ignoreDuplicates: true },
    );

    if (error) {
      throw new Error("예산을 복사하지 못했어요.", { cause: error });
    }
  }

  if (prevTotal) {
    const { error } = await supabase
      .from("monthly_budgets")
      .upsert(
        { user_id: user.id, month: toMonth, amount: prevTotal.amount },
        { onConflict: "user_id,month", ignoreDuplicates: true },
      );

    if (error) {
      throw new Error("총예산을 복사하지 못했어요.", { cause: error });
    }
  }

  revalidateAll();
  return { copied: true };
}
