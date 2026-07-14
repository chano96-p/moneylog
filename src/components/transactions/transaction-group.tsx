import { formatAmount, formatDate, formatDayLabel } from "@/lib/format";
import type { TransactionWithCategory } from "@/lib/types";
import { TransactionRow } from "./transaction-row";

type TransactionGroupProps = {
  date: string;
  transactions: TransactionWithCategory[];
};

export function TransactionGroup({
  date,
  transactions,
}: TransactionGroupProps) {
  const total = transactions.reduce(
    (sum, tx) => sum + (tx.type === "income" ? tx.amount : -tx.amount),
    0,
  );

  return (
    <div>
      <div className="flex items-center justify-between border-b border-gray-100 pt-4 pb-2.75">
        <p className="text-[13px] font-bold text-gray-700">
          {formatDate(date)}{" "}
          <span className="font-semibold text-muted-foreground">
            {formatDayLabel(date)}
          </span>
        </p>
        <p
          className={`text-[13px] font-semibold tabular-nums ${
            total > 0 ? "text-income" : "text-muted-foreground"
          }`}
        >
          {total > 0 && "+"}
          {total < 0 && "-"}
          {formatAmount(Math.abs(total))}원
        </p>
      </div>

      <ul>
        {transactions.map((tx) => (
          <TransactionRow key={tx.id} transaction={tx} />
        ))}
      </ul>
    </div>
  );
}
