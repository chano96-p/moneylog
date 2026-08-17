import { revalidatePath } from "next/cache";

/** 거래·카테고리·예산 변경은 모든 집계 화면에 영향 → 전부 무효화 */
export function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/categories");
  revalidatePath("/budgets");
  revalidatePath("/reports");
  revalidatePath("/recurring");
}
