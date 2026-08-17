"use server";

import z from "zod";
import { currentMonthKST } from "../format";
import {
  type RecurringRuleInput,
  type RecurringRuleUpdateInput,
  recurringRuleInputSchema,
  recurringRuleUpdateSchema,
} from "../schemas";
import { createClient } from "../supabase/server";
import { revalidateAll } from "./revalidate";
import { assertValidCategory } from "./shared";

/**
 * 규칙 저장 후 이번 달분을 즉시 생성.
 * 생성만 실패하면 규칙은 이미 저장됐으므로 throw하지 않는다 —
 * throw하면 모달이 안 닫혀 재클릭 시 같은 규칙이 중복 INSERT됨.
 * 다음 방문 때 자동 생성되므로 warning으로만 알린다.
 */
export async function createRecurringRule(
  input: RecurringRuleInput,
): Promise<{ warning?: string }> {
  const data = recurringRuleInputSchema.parse(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  await assertValidCategory(supabase, data.category_id, data.type);

  const { error } = await supabase
    .from("recurring_rules")
    .insert({ ...data, user_id: user.id });

  if (error) {
    throw new Error("반복 거래를 저장하지 못했어요.", { cause: error });
  }

  // 등록 즉시 이번 달분 생성 — 지난 날짜여도 해당 일자로 소급
  const { error: rpcError } = await supabase.rpc("materialize_recurring", {
    target_month: currentMonthKST(),
  });

  revalidateAll();

  if (rpcError) {
    return {
      warning:
        "반복 거래는 등록했지만 이번 달 거래 생성에 실패했어요. 다음 방문 때 자동으로 생성돼요.",
    };
  }
  return {};
}

export async function updateRecurringRule(input: RecurringRuleUpdateInput) {
  const { id, ...data } = recurringRuleUpdateSchema.parse(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  await assertValidCategory(supabase, data.category_id, data.type);

  const { data: updated, error } = await supabase
    .from("recurring_rules")
    .update(data)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !updated) {
    throw new Error("반복 거래를 수정하지 못했어요.", { cause: error });
  }

  revalidateAll();
}

export async function deleteRecurringRule(input: string) {
  const id = z.string().uuid().parse(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const { data: deleted, error } = await supabase
    .from("recurring_rules")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !deleted) {
    throw new Error("반복 거래를 삭제하지 못했어요.", { cause: error });
  }

  revalidateAll();
}
