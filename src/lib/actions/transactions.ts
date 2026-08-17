"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import z from "zod";
import {
  type TransactionInput,
  type TransactionUpdateInput,
  transactionInputSchema,
  transactionUpdateSchema,
} from "../schemas";
import { createClient } from "../supabase/server";
import type { TransactionType } from "../types";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/categories");
  revalidatePath("/budgets");
  revalidatePath("/reports");
}

// 공통: 카테고리 소유권 + type 일치 (RLS가 남의 카테고리를 걸러줌)
async function assertValidCategory(
  supabase: SupabaseClient,
  categoryId: string | null,
  type: TransactionType,
) {
  if (!categoryId) return;

  const { data } = await supabase
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .eq("type", type)
    .maybeSingle();

  if (!data) throw new Error("올바르지 않은 카테고리예요.");
}

export async function createTransaction(input: TransactionInput) {
  const data = transactionInputSchema.parse(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요해요.");

  await assertValidCategory(supabase, data.category_id, data.type);

  const { error } = await supabase
    .from("transactions")
    .insert({ ...data, user_id: user.id });

  if (error) {
    throw new Error("거래를 저장하지 못했어요.", { cause: error });
  }

  revalidateAll();
}

export async function updateTransaction(input: TransactionUpdateInput) {
  const { id, ...data } = transactionUpdateSchema.parse(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  await assertValidCategory(supabase, data.category_id, data.type);

  // .select()로 실제 반영 확인 — RLS의 "조용한 0건" 방지
  const { data: updated, error } = await supabase
    .from("transactions")
    .update(data)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !updated) {
    throw new Error("거래를 수정하지 못했어요.", { cause: error });
  }

  revalidateAll();
}

export async function deleteTransaction(input: string) {
  const id = z.string().uuid().parse(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const { data: deleted, error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !deleted) {
    throw new Error("거래를 삭제하지 못했어요.", { cause: error });
  }

  revalidateAll();
}
