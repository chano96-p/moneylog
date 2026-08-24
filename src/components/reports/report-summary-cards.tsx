import { TRANSACTION_TYPE_LABEL } from "@/lib/constants";
import { formatAmount } from "@/lib/format";
import type { TransactionType } from "@/lib/types";

type Sums = Record<TransactionType, number>;

type ReportSummaryCardsProps = {
  sums: Sums;
  prevSums: Sums;
  /** "지난달" | "작년" */
  compareLabel: string;
};

/** 수입/지출/저축/잔액 4칸 + 전기 대비 배지 */
export function ReportSummaryCards({
  sums,
  prevSums,
  compareLabel,
}: ReportSummaryCardsProps) {
  const balance = sums.income - sums.expense - sums.saving;

  return (
    <div className="flex gap-3.5">
      {(["income", "expense", "saving"] as const).map((t) => (
        <Card
          key={t}
          label={`총 ${TRANSACTION_TYPE_LABEL[t]}`}
          className={
            t === "income"
              ? "text-income"
              : t === "saving"
                ? "text-saving"
                : "text-foreground"
          }
          badge={
            <DiffBadge
              current={sums[t]}
              previous={prevSums[t]}
              moreIsGood={t !== "expense"}
              compareLabel={compareLabel}
            />
          }
        >
          {sums[t] > 0 && (t === "income" ? "+" : "-")}
          {formatAmount(sums[t])}원
        </Card>
      ))}
      <Card label="잔액" className="text-primary">
        {balance < 0 && "-"}
        {formatAmount(Math.abs(balance))}원
      </Card>
    </div>
  );
}

function DiffBadge({
  current,
  previous,
  moreIsGood,
  compareLabel,
}: {
  current: number;
  previous: number;
  moreIsGood: boolean;
  compareLabel: string;
}) {
  if (previous <= 0) return null;
  const percent = Math.round(((current - previous) / previous) * 100);
  if (percent === 0) return null;

  const up = percent > 0;
  const good = moreIsGood ? up : !up;

  return (
    <span
      className={`text-[12px] font-bold ${good ? "text-income" : "text-expense"}`}
      title={`${compareLabel} 대비`}
    >
      {up ? "▲" : "▼"} {Math.abs(percent)}%
    </span>
  );
}

function Card({
  label,
  className,
  badge,
  children,
}: {
  label: string;
  className: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1.75 rounded-2xl bg-card px-5 py-4.5 shadow-card">
      <p className="flex items-center justify-between text-[13px] font-semibold text-muted-foreground">
        {label}
        {badge}
      </p>
      <p className={`text-[22px] font-extrabold tabular-nums ${className}`}>
        {children}
      </p>
    </div>
  );
}
