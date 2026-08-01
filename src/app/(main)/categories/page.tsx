import { AddCategoryButton } from "@/components/categories/add-category-button";
import { CategoryCard } from "@/components/categories/category-card";
import { CategoryTypeTabs } from "@/components/categories/category-type-tabs";
import { EmptyState } from "@/components/common/empty-state";
import { MonthNav } from "@/components/common/month-nav";
import { monthAfterKST, parseMonthParam } from "@/lib/format";
import { getBudgetsByMonth } from "@/lib/queries/budgets";
import {
  getCategories,
  getTransactionCountByCategory,
} from "@/lib/queries/categories";
import { getTransactionsByMonth } from "@/lib/queries/transactions";
import type { TransactionType } from "@/lib/types";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; month?: string }>;
}) {
  const params = await searchParams;
  const type: TransactionType = params.type === "income" ? "income" : "expense";
  const month = parseMonthParam(params.month);

  const [categories, transactions, budgets] = await Promise.all([
    getCategories(),
    getTransactionsByMonth(month),
    getBudgetsByMonth(month),
  ]);
  const txCounts = await getTransactionCountByCategory(
    categories.map((c) => c.id),
  );

  // 카테고리별 합계: 한 달치 거래는 유계라 SQL 집계 대신 JS
  // (12개월 추이와 달리 데이터가 선형 증가하지 않음)
  const categoryType = new Map(categories.map((c) => [c.id, c.type] as const));
  const spentByCategory = new Map<string, number>();
  for (const tx of transactions) {
    if (!tx.category_id) continue;
    // 카테고리 type과 거래 type이 어긋나면 제외 (데이터 정합성 방어)
    if (categoryType.get(tx.category_id) !== tx.type) continue;
    spentByCategory.set(
      tx.category_id,
      (spentByCategory.get(tx.category_id) ?? 0) + tx.amount,
    );
  }

  const budgetByCategory = new Map(
    budgets.map((b) => [b.category_id, b.amount] as const),
  );

  const counts = {
    expense: categories.filter((c) => c.type === "expense").length,
    income: categories.filter((c) => c.type === "income").length,
  };

  const visible = categories.filter((c) => c.type === type);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold text-foreground">
            카테고리
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            카테고리별 예산을 설정하고 지출을 관리하세요
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <MonthNav month={month} maxMonth={monthAfterKST(12)} />
          <AddCategoryButton type={type} month={month} />
        </div>
      </div>

      <CategoryTypeTabs current={type} counts={counts} />

      {visible.length === 0 ? (
        <div className="rounded-2xl bg-card shadow-card">
          <EmptyState
            icon="category"
            title="카테고리가 없어요"
            description="카테고리를 추가하면 여기에 표시돼요."
          />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3.5">
          {visible.map((c) => (
            <CategoryCard
              key={c.id}
              category={c}
              monthTotal={spentByCategory.get(c.id) ?? 0}
              budget={budgetByCategory.get(c.id) ?? null}
              month={month}
              transactionCount={txCounts.get(c.id) ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
