import { formatAmount } from "@/lib/format";
import type { TransactionWithCategory } from "@/lib/types";

export function SummaryCards({
  transactions,
}: {
  transactions: TransactionWithCategory[];
}) {
  const income = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expense = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const saving = transactions
    .filter((tx) => tx.type === "saving")
    .reduce((sum, tx) => sum + tx.amount, 0);
  // 저축은 쓸 수 있는 돈에서 빠져나간 것 → 합계에서 차감
  const total = income - expense - saving;

  return (
    <div className="flex gap-3.5">
      <Card label="총 수입" className="text-income">
        {income > 0 && "+"}
        {formatAmount(income)}원
      </Card>
      <Card label="총 지출" className="text-foreground">
        {expense > 0 && "-"}
        {formatAmount(expense)}원
      </Card>
      <Card label="총 저축" className="text-saving">
        {saving > 0 && "-"}
        {formatAmount(saving)}원
      </Card>
      <Card label="합계" className="text-primary">
        {total >= 0 ? "+" : "-"}
        {formatAmount(Math.abs(total))}원
      </Card>
    </div>
  );
}

function Card({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1.75 rounded-2xl bg-card px-5 py-4.5 shadow-card">
      <p className="text-[13px] font-semibold text-muted-foreground">{label}</p>
      <p className={`text-[22px] font-extrabold tabular-nums ${className}`}>
        {children}
      </p>
    </div>
  );
}
