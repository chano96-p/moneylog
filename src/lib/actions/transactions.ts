"use server";

import { revalidatePath } from "next/cache";
import { type TransactionInput, transactionInputSchema } from "../schemas";
import { createClient } from "../supabase/server";

export async function createTransaction(input: TransactionInput) {
  const data = transactionInputSchema.parse(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("로그인이 필요해요.");

  if (data.category_id) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("id", data.category_id)
      .eq("type", data.type)
      .maybeSingle();

    if (!category) throw new Error("올바르지 않은 카테고리예요.");
  }

  const { error } = await supabase
    .from("transactions")
    .insert({ ...data, user_id: user.id });

  if (error) throw new Error("거래를 저장하지 못했어요.");

  revalidatePath("/transactions");
}
