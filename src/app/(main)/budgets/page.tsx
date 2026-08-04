import { BudgetRow } from "@/components/budgets/budget-row";
import { BudgetSummary } from "@/components/budgets/budget-summary";
import { EmptyState } from "@/components/common/empty-state";
import { MonthNav } from "@/components/common/month-nav";
import { monthAfterKST, parseMonthParam } from "@/lib/format";
import { getBudgetsByMonth } from "@/lib/queries/budgets";
import { getCategories } from "@/lib/queries/categories";
import { getTransactionsByMonth } from "@/lib/queries/transactions";
import type { Category } from "@/lib/types";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const month = parseMonthParam(params.month);

  const [categories, transactions, budgets] = await Promise.all([
    getCategories(),
    getTransactionsByMonth(month),
    getBudgetsByMonth(month),
  ]);

  const spentByCategory = new Map<string, number>();
  const categoryType = new Map(categories.map((c) => [c.id, c.type] as const));
  for (const tx of transactions) {
    if (!tx.category_id) continue;
    if (categoryType.get(tx.category_id) !== tx.type) continue;
    spentByCategory.set(
      tx.category_id,
      (spentByCategory.get(tx.category_id) ?? 0) + tx.amount,
    );
  }

  const categoryById = new Map(categories.map((c) => [c.id, c] as const));
  const rate = (r: { spent: number; budget: number }) =>
    r.budget > 0 ? r.spent / r.budget : 0;

  // 예산이 설정된 것만, 사용률 높은 순
  const rows = budgets
    .map((b) => ({
      category: categoryById.get(b.category_id),
      budget: b.amount,
      spent: spentByCategory.get(b.category_id) ?? 0,
    }))
    .filter(
      (r): r is typeof r & { category: Category } =>
        r.category !== undefined && r.category.type === "expense",
    )
    .sort((a, b) => rate(b) - rate(a));

  const totalBudget = rows.reduce((s, r) => s + r.budget, 0);
  const totalSpent = rows.reduce((s, r) => s + r.spent, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold text-foreground">예산</h1>
        <MonthNav month={month} maxMonth={monthAfterKST(12)} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl bg-card shadow-card">
          <EmptyState
            icon="savings"
            title="설정한 예산이 없어요"
            description="카테고리 화면에서 월 예산을 설정해 보세요."
          />
        </div>
      ) : (
        <>
          <BudgetSummary
            month={month}
            budget={totalBudget}
            spent={totalSpent}
          />

          <section className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="text-[16px] font-bold text-foreground">
              카테고리별 예산
            </h2>
            <ul className="mt-1">
              {rows.map((r) => (
                <BudgetRow
                  key={r.category.id}
                  category={r.category}
                  spent={r.spent}
                  budget={r.budget}
                />
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
