import { AMOUNT_COLOR } from "@/lib/constants";
import { formatAmount } from "@/lib/format";
import type { TransactionWithCategory } from "@/lib/types";
import { Icon } from "../common/icon";

const FALLBACK_COLOR = "var(--cat-etc)";

type TransactionRowProps = {
  transaction: TransactionWithCategory;
  onSelect: (tx: TransactionWithCategory) => void;
};

export function TransactionRow({
  transaction: tx,
  onSelect,
}: TransactionRowProps) {
  const color = tx.category?.color ?? FALLBACK_COLOR;
  const title = tx.memo?.trim() || tx.category?.name || "거래";

  return (
    <li className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => onSelect(tx)}
        className="flex w-full cursor-pointer items-center gap-3.25 pt-3.25 pb-3.5 text-left"
      >
        <div
          className="flex size-10.5 shrink-0 items-center justify-center rounded-[13px]"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
          }}
        >
          <Icon name={tx.category?.icon ?? "help"} size={21} color={color} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold text-foreground">
            {title}
          </p>
          <p className="truncate text-[12px] text-muted-foreground">
            {tx.category?.name ?? "미분류"}
          </p>
        </div>

        <p
          className={`shrink-0 text-[15px] font-bold tabular-nums ${AMOUNT_COLOR[tx.type]}`}
        >
          {tx.type === "income" ? "+" : "-"}
          {formatAmount(tx.amount)}원
        </p>
      </button>
    </li>
  );
}
