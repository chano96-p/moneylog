import { format, parse, subMonths } from "date-fns";
import { Icon } from "@/components/common/icon";
import { formatAmount } from "@/lib/format";
import type { MonthlyTotal } from "@/lib/queries/transactions";
import type { TransactionWithCategory } from "@/lib/types";

type HeroCardProps = {
  month: string; // 'YYYY-MM'
  transactions: TransactionWithCategory[]; // 해당 월 전체
  monthlyTotals: MonthlyTotal[]; // 전월 비교용
  budget: number; // 한도 (budgetUsage 결과)
  budgetSpent: number; // 한도와 같은 범위의 사용액 (budgetUsage 결과)
};

export function HeroCard({
  month,
  transactions,
  monthlyTotals,
  budget,
  budgetSpent,
}: HeroCardProps) {
  const income = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expense = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const saving = transactions
    .filter((tx) => tx.type === "saving")
    .reduce((sum, tx) => sum + tx.amount, 0);
  // 잔액 = 이번 달 쓸 수 있는 남은 돈. 저축은 이미 묶인 돈이라 차감
  const balance = income - expense - saving;

  // 전월 데이터가 0이면 비교 무의미
  const prevMonth = format(
    subMonths(parse(month, "yyyy-MM", new Date()), 1),
    "yyyy-MM",
  );
  const prevExpense = monthlyTotals.find((m) => m.month === prevMonth)?.total;
  const diff = prevExpense ? expense - prevExpense : null;

  const ratio = budget > 0 ? budgetSpent / budget : null;
  const remaining = budget - budgetSpent;

  return (
    <section className="rounded-2xl bg-card p-7 shadow-card">
      <div className="flex items-start justify-between">
        {/* 좌: 총 지출 */}
        <div className="flex flex-col gap-2">
          <p className="text-[14px] font-bold text-muted-foreground">
            이번 달 총 지출
          </p>
          <p className="flex items-baseline gap-1">
            <span className="text-[39px] font-extrabold tracking-[-1.2px] text-foreground tabular-nums">
              {formatAmount(expense)}
            </span>
            <span className="text-[23px] font-bold text-muted-foreground">
              원
            </span>
          </p>
          {diff !== null && <CompareBadge diff={diff} />}
        </div>

        {/* 우: 수입 / 저축 / 잔액 */}
        <div className="flex gap-3.5">
          <Pill label="수입" className="text-income">
            +{formatAmount(income)}
          </Pill>
          <Pill label="저축" className="text-saving">
            {formatAmount(saving)}
          </Pill>
          <Pill label="잔액" className="text-foreground">
            {balance < 0 && "-"}
            {formatAmount(Math.abs(balance))}
          </Pill>
        </div>
      </div>

      {/* 예산 진행 — 미설정이면 렌더 안 함 */}
      {ratio !== null && (
        <div className="mt-6">
          <div className="flex items-center justify-between pb-2">
            <p className="text-[13px] font-semibold text-gray-700">
              예산 {formatAmount(budget)}원 중 {Math.round(ratio * 100)}% 사용
            </p>
            <p
              className={`text-[13px] font-semibold ${
                remaining < 0 ? "text-expense" : "text-primary"
              }`}
            >
              {remaining < 0
                ? `예산 초과 ${formatAmount(-remaining)}원`
                : `남은 예산 ${formatAmount(remaining)}원`}
            </p>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full ${remaining < 0 ? "bg-expense" : "bg-primary"}`}
              style={{ width: `${Math.min(ratio, 1) * 100}%` }}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function CompareBadge({ diff }: { diff: number }) {
  if (diff === 0) return null;
  const less = diff < 0; // 지난달보다 덜 씀 = 좋음(그린)

  return (
    <p
      className={`flex w-fit items-center gap-1 rounded-lg px-2.5 pt-1.5 pb-1 text-[13px] font-bold ${
        less ? "bg-income-bg text-income" : "bg-expense-bg text-expense"
      }`}
    >
      <Icon
        name={less ? "trending_down" : "trending_up"}
        size={15}
        color="currentColor"
      />
      지난달보다 {formatAmount(Math.abs(diff))}원 {less ? "덜" : "더"} 썼어요
    </p>
  );
}

function Pill({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-37.5 flex-col gap-1.5 rounded-lg bg-gray-50 px-5 py-4">
      <p className="text-[13px] font-semibold text-muted-foreground">{label}</p>
      <p className={`text-[20px] font-extrabold tabular-nums ${className}`}>
        {children}
      </p>
    </div>
  );
}
