import { format, parse } from "date-fns";
import { ko } from "date-fns/locale";
import { MonthNav } from "@/components/common/month-nav";
import { CategoryExpenseCard } from "@/components/dashboard/category-expense-card";
import { HeroCard } from "@/components/dashboard/hero-card";
import { MonthlyTrendCard } from "@/components/dashboard/monthly-trend-card";
import { RecentTransactionsCard } from "@/components/dashboard/recent-transactions-card";
import { RecurringFailedBanner } from "@/components/recurring/recurring-failed-banner";
import { AddTransactionButton } from "@/components/transactions/add-transaction-button";
import { budgetUsage } from "@/lib/aggregate";
import { parseMonthParam } from "@/lib/format";
import { getBudgetsByMonth, getMonthlyBudget } from "@/lib/queries/budgets";
import { getCategories } from "@/lib/queries/categories";
import { ensureRecurringGenerated } from "@/lib/queries/recurring";
import {
  getMonthlyTotals,
  getTransactionsByMonth,
} from "@/lib/queries/transactions";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const month = parseMonthParam(params.month);

  // 조회 전에 이번 달 반복 거래를 먼저 생성 (없으면 no-op)
  const recurringOk = await ensureRecurringGenerated();

  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    monthTransactions,
    monthlyTotals,
    categories,
    budgets,
    monthlyBudget,
  ] = await Promise.all([
    supabase.auth.getUser(),
    getTransactionsByMonth(month),
    getMonthlyTotals({ count: 12, baseMonth: month }),
    getCategories(),
    getBudgetsByMonth(month),
    getMonthlyBudget(month),
  ]);

  const name = (user?.user_metadata.name as string | undefined) ?? "회원";
  const monthLabel = format(parse(month, "yyyy-MM", new Date()), "M월", {
    locale: ko,
  });

  const usage = budgetUsage(monthTransactions, budgets, monthlyBudget);

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold text-foreground">
            안녕하세요, {name}님 👋
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {monthLabel} 가계부를 한눈에 확인해 보세요
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <MonthNav month={month} />
          <AddTransactionButton categories={categories} />
        </div>
      </div>

      {!recurringOk && <RecurringFailedBanner />}

      <HeroCard
        month={month}
        transactions={monthTransactions}
        monthlyTotals={monthlyTotals}
        budget={usage.budget}
        budgetSpent={usage.spent}
      />

      <div className="grid grid-cols-2 gap-5">
        <CategoryExpenseCard transactions={monthTransactions} />
        <RecentTransactionsCard transactions={monthTransactions} />
      </div>

      <MonthlyTrendCard totals={monthlyTotals} />
    </div>
  );
}
