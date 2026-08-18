import type { Budget, Category, TransactionWithCategory } from "@/lib/types";

export type BudgetUsage = {
  /** 한도 — 총예산 우선, 없으면 카테고리 예산 합 */
  budget: number;
  /** 사용액 — 총예산이면 월 전체 지출, 아니면 예산 잡힌 카테고리 지출만 */
  spent: number;
  /** 총예산이 설정돼 있는가 */
  isTotal: boolean;
};

/**
 * 예산 사용률 계산 — 홈·예산 페이지가 공유하는 단일 규칙.
 * 분자(사용액)와 분모(한도)의 범위를 항상 일치시킨다:
 * 한도가 "전체"면 사용액도 전체, 한도가 "일부 카테고리 합"이면 사용액도 그 카테고리들만.
 */
export function budgetUsage(
  transactions: TransactionWithCategory[],
  budgets: Budget[],
  monthlyBudget: number | null,
): BudgetUsage {
  const expenses = transactions.filter((tx) => tx.type === "expense");

  if (monthlyBudget !== null) {
    return {
      budget: monthlyBudget,
      spent: expenses.reduce((s, tx) => s + tx.amount, 0),
      isTotal: true,
    };
  }

  const budgeted = new Set(budgets.map((b) => b.category_id));
  return {
    budget: budgets.reduce((s, b) => s + b.amount, 0),
    spent: expenses
      .filter((tx) => tx.category_id && budgeted.has(tx.category_id))
      .reduce((s, tx) => s + tx.amount, 0),
    isTotal: false,
  };
}

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
