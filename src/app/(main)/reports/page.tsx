import { format, parse, subMonths } from "date-fns";
import { EmptyState } from "@/components/common/empty-state";
import { MonthNav } from "@/components/common/month-nav";
import { CategoryRanking } from "@/components/reports/category-ranking";
import { MonthComparison } from "@/components/reports/month-comparison";
import { ReportTypeTabs } from "@/components/reports/report-type-tabs";
import { totalsByCategory } from "@/lib/aggregate";
import { formatAmount, formatAmountShort, parseMonthParam } from "@/lib/format";
import {
  getMonthlyTotals,
  getTransactionsByMonth,
} from "@/lib/queries/transactions";
import type { TransactionType } from "@/lib/types";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; type?: string }>;
}) {
  const params = await searchParams;
  const month = parseMonthParam(params.month);
  const type: TransactionType = params.type === "income" ? "income" : "expense";

  const prevMonth = format(
    subMonths(parse(month, "yyyy-MM", new Date()), 1),
    "yyyy-MM",
  );

  const [current, previous, monthlyTotals] = await Promise.all([
    getTransactionsByMonth(month),
    getTransactionsByMonth(prevMonth),
    getMonthlyTotals({ count: 3, baseMonth: month, type }),
  ]);

  const totals = totalsByCategory(current, type);
  const previousTotals = new Map(
    totalsByCategory(previous, type).map((t) => [t.id, t.total] as const),
  );

  const sum = totals.reduce((s, t) => s + t.total, 0);
  const prevSum = monthlyTotals.at(-2)?.total ?? 0;
  const diffRatio = prevSum > 0 ? (sum - prevSum) / prevSum : null;

  const monthLabel = format(parse(month, "yyyy-MM", new Date()), "M월");

  const isIncome = type === "income";
  const isGood =
    diffRatio !== null && (isIncome ? diffRatio > 0 : diffRatio < 0);
  const diffColor =
    diffRatio === null ? "" : isGood ? "text-income" : "text-expense";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold text-foreground">리포트</h1>
        <div className="flex items-center gap-2.5">
          <ReportTypeTabs current={type} />
          <MonthNav month={month} />
        </div>
      </div>

      <div className="grid grid-cols-[1fr_2fr] gap-5">
        {/* 총액 */}
        <section className="flex flex-col items-center justify-center rounded-2xl bg-card p-6 shadow-card">
          <p className="text-[13px] font-semibold text-muted-foreground">
            {monthLabel} 총 {type === "income" ? "수입" : "지출"}
          </p>
          <p className="mt-6 text-[32px] font-extrabold text-foreground tabular-nums">
            {formatAmountShort(sum)}
          </p>
          {diffRatio !== null && Math.round(diffRatio * 100) !== 0 && (
            <p className={`mt-1 text-[13px] font-bold ${diffColor}`}>
              {diffRatio > 0 ? "▲" : "▼"}{" "}
              {Math.abs(Math.round(diffRatio * 100))}%
            </p>
          )}
        </section>

        {/* 월별 비교 */}
        <section className="flex flex-col rounded-2xl bg-card p-6 shadow-card">
          <h2 className="text-[16px] font-bold text-foreground">월별 비교</h2>
          {diffRatio !== null && Math.round(diffRatio * 100) !== 0 && (
            <p className="mt-1 text-[13px] text-muted-foreground">
              지난달보다{" "}
              <span className={`font-bold ${diffColor}`}>
                {formatAmount(Math.abs(sum - prevSum))}원
              </span>{" "}
              {isIncome
                ? diffRatio > 0
                  ? "더 벌었어요"
                  : "덜 벌었어요"
                : diffRatio > 0
                  ? "많이 썼어요"
                  : "적게 썼어요"}
            </p>
          )}
          <MonthComparison totals={monthlyTotals} />
        </section>
      </div>

      {totals.length === 0 ? (
        <div className="rounded-2xl bg-card shadow-card">
          <EmptyState
            icon="monitoring"
            title="집계할 내역이 없어요"
            description="거래를 입력하면 리포트가 만들어져요."
          />
        </div>
      ) : (
        <CategoryRanking
          totals={totals}
          previousTotals={previousTotals}
          type={type}
        />
      )}
    </div>
  );
}
