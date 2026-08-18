import { format, parse } from "date-fns";
import { formatAmount } from "@/lib/format";

export function BudgetSummary({
  month,
  budget,
  spent,
  budgetLabel,
}: {
  month: string;
  budget: number;
  spent: number;
  budgetLabel: string;
}) {
  const ratio = budget > 0 ? spent / budget : 0;
  const remaining = budget - spent;
  const percent = Math.round(ratio * 100);
  const over = remaining < 0;
  const monthLabel = format(parse(month, "yyyy-MM", new Date()), "M월");

  return (
    <section className="rounded-2xl bg-card p-7 shadow-card">
      <div className="flex items-center gap-8">
        {/* 원형 게이지 */}
        <div className="relative size-33 shrink-0">
          <svg
            viewBox="0 0 132 132"
            className="size-full -rotate-90"
            role="presentation"
            aria-hidden="true"
          >
            <circle
              cx="66"
              cy="66"
              r="58"
              fill="none"
              stroke="var(--gray-100)"
              strokeWidth="14"
            />
            <circle
              cx="66"
              cy="66"
              r="58"
              fill="none"
              stroke={over ? "var(--expense)" : "var(--brand)"}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 58}
              strokeDashoffset={2 * Math.PI * 58 * (1 - Math.min(ratio, 1))}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`text-[24px] font-extrabold tabular-nums ${
                over ? "text-expense" : "text-foreground"
              }`}
            >
              {percent}%
            </span>
            <span className="text-[12px] font-semibold text-muted-foreground">
              사용
            </span>
          </div>
        </div>

        {/* 수치 3줄 */}
        <dl className="flex flex-1 flex-col gap-3.5">
          <Row
            label={`${monthLabel} ${budgetLabel}`}
            value={`${formatAmount(budget)}원`}
          />
          <Row label="사용한 금액" value={`${formatAmount(spent)}원`} />
          <Row
            label={over ? "초과한 금액" : "남은 예산"}
            value={`${formatAmount(Math.abs(remaining))}원`}
            className={over ? "text-expense" : "text-primary"}
          />
        </dl>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[14px] text-muted-foreground">{label}</dt>
      <dd
        className={`text-[16px] font-bold tabular-nums ${className ?? "text-foreground"}`}
      >
        {value}
      </dd>
    </div>
  );
}
