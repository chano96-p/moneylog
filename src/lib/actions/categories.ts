"use server";

import z from "zod";
import {
  type CategoryInput,
  type CategoryUpdateInput,
  categoryInputSchema,
  categoryUpdateSchema,
} from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import { revalidateAll } from "./revalidate";

const DUPLICATE = "23505";

/** 예산 upsert — null이면 삭제 */
async function saveBudget(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  categoryId: string,
  month: string,
  budget: number | null,
) {
  if (budget === null) {
    const { error } = await supabase
      .from("budgets")
      .delete()
      .eq("category_id", categoryId)
      .eq("month", month);

    if (error) {
      throw new Error("예산을 삭제하지 못했어요.", { cause: error });
    }
    return;
  }

  const { error } = await supabase.from("budgets").upsert(
    {
      user_id: userId,
      category_id: categoryId,
      month,
      amount: budget,
    },
    { onConflict: "user_id,category_id,month" },
  );

  if (error) {
    throw new Error("예산을 저장하지 못했어요.", { cause: error });
  }
}

export async function createCategory(input: CategoryInput) {
  const { budget, month, ...category } = categoryInputSchema.parse(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const { data, error } = await supabase
    .from("categories")
    .insert({ ...category, user_id: user.id })
    .select("id")
    .single();

  if (error) {
    if (error.code === DUPLICATE) {
      throw new Error("같은 이름의 카테고리가 이미 있어요.");
    }
    throw new Error("카테고리를 저장하지 못했어요.", { cause: error });
  }

  try {
    await saveBudget(supabase, user.id, data.id, month, budget);
  } catch {
    revalidateAll();
    throw new Error(
      "카테고리는 추가했지만 예산 저장에 실패했어요. 수정에서 다시 시도해 주세요.",
    );
  }
  revalidateAll();
}

export async function updateCategory(input: CategoryUpdateInput) {
  const { id, budget, month, ...category } = categoryUpdateSchema.parse(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const { data, error } = await supabase
    .from("categories")
    .update(category)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error?.code === DUPLICATE) {
    throw new Error("같은 이름의 카테고리가 이미 있어요.");
  }
  if (error || !data) {
    throw new Error("카테고리를 수정하지 못했어요.", { cause: error });
  }

  await saveBudget(supabase, user.id, id, month, budget);
  revalidateAll();
}

export async function deleteCategory(input: string) {
  const parsed = z.string().uuid().safeParse(input);
  if (!parsed.success) throw new Error("올바르지 않은 카테고리예요.");
  const id = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("로그인이 필요해요.");

  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    throw new Error("카테고리를 삭제하지 못했어요.", { cause: error });
  }

  revalidateAll();
}
