import type { SupabaseClient } from "@supabase/supabase-js";
import type { TransactionType } from "../types";

// "use server" 파일의 export는 공개 액션 엔드포인트가 되므로
// 내부 헬퍼는 이 파일(비-액션 모듈)에 둔다.

/** 카테고리 소유권 + type 일치 (RLS가 남의 카테고리를 걸러줌) */
export async function assertValidCategory(
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
