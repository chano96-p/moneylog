import { formatAmount, formatDate } from "@/lib/format";
import type { TransactionWithCategory } from "@/lib/types";
import { Icon } from "../common/icon";

export function TransactionRow({
  transaction: tx,
}: {
  transaction: TransactionWithCategory;
}) {
  const isIncome = tx.type === "income";

  return (
    <li className="flex items-center gap-4 px-6 py-4">
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${tx.category?.color ?? "#adb5bd"}1a` }}
      >
        <Icon
          name={tx.category?.icon ?? "help"}
          size={20}
          color={tx.category?.color ?? "#adb5bd"}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{tx.category?.name ?? "미분류"}</p>
        {tx.memo && (
          <p className="truncate text-sm text-neutral-500">{tx.memo}</p>
        )}
      </div>

      <time className="shrink-0 text-sm text-neutral-400">
        {formatDate(tx.date)}
      </time>

      <p
        className={`shrink-0 tabular-nums font-semibold ${
          isIncome ? "text-green-600" : "text-red-500"
        }`}
      >
        {isIncome ? "+" : "-"}
        {formatAmount(tx.amount)}원
      </p>
    </li>
  );
}
