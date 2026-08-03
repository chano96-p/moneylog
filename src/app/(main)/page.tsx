import { format, parse } from "date-fns";
import { ko } from "date-fns/locale";
import { MonthNav } from "@/components/common/month-nav";
import { CategoryExpenseCard } from "@/components/dashboard/category-expense-card";
import { HeroCard } from "@/components/dashboard/hero-card";
import { MonthlyTrendCard } from "@/components/dashboard/monthly-trend-card";
import { RecentTransactionsCard } from "@/components/dashboard/recent-transactions-card";
import { AddTransactionButton } from "@/components/transactions/add-transaction-button";
import { parseMonthParam } from "@/lib/format";
import { getBudgetsByMonth } from "@/lib/queries/budgets";
import { getCategories } from "@/lib/queries/categories";
import {
  getMonthlyExpenseTotals,
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

  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    monthTransactions,
    monthlyTotals,
    categories,
    budgets,
  ] = await Promise.all([
    supabase.auth.getUser(),
    getTransactionsByMonth(month),
    getMonthlyExpenseTotals(12, month),
    getCategories(),
    getBudgetsByMonth(month),
  ]);

  const name = (user?.user_metadata.name as string | undefined) ?? "회원";
  const monthLabel = format(parse(month, "yyyy-MM", new Date()), "M월", {
    locale: ko,
  });

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);

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

      <HeroCard
        month={month}
        transactions={monthTransactions}
        monthlyTotals={monthlyTotals}
        budget={totalBudget}
      />

      <div className="grid grid-cols-2 gap-5">
        <CategoryExpenseCard transactions={monthTransactions} />
        <RecentTransactionsCard transactions={monthTransactions} />
      </div>

      <MonthlyTrendCard totals={monthlyTotals} />
    </div>
  );
}
