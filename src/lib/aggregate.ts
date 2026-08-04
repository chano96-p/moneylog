import type { Category, TransactionWithCategory } from "@/lib/types";

export type CategoryTotal = {
  id: string;
  name: string;
  icon: string;
  color: string;
  total: number;
};

const FALLBACK = { name: "미분류", icon: "help", color: "var(--gray-500)" };

/** 카테고리별 합계 — 금액 내림차순 */
export function totalsByCategory(
  transactions: TransactionWithCategory[],
  type: Category["type"],
): CategoryTotal[] {
  const map = new Map<string, CategoryTotal>();

  for (const tx of transactions) {
    if (tx.type !== type) continue;
    const id = tx.category_id ?? "none";
    const prev = map.get(id);
    if (prev) {
      prev.total += tx.amount;
    } else {
      map.set(id, {
        id,
        name: tx.category?.name ?? FALLBACK.name,
        icon: tx.category?.icon ?? FALLBACK.icon,
        color: tx.category?.color ?? FALLBACK.color,
        total: tx.amount,
      });
    }
  }

  return [...map.values()].sort((a, b) => b.total - a.total);
}
