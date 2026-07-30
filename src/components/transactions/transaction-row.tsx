import { AMOUNT_COLOR } from "@/lib/constants";
import { formatAmount, formatDate } from "@/lib/format";
import type { TransactionWithCategory } from "@/lib/types";
import { Icon } from "../common/icon";

const FALLBACK_COLOR = "var(--cat-etc)";

type TransactionRowProps = {
  transaction: TransactionWithCategory;
  onSelect?: (tx: TransactionWithCategory) => void;
  showDate?: boolean;
};

export function TransactionRow({
  transaction: tx,
  onSelect,
  showDate = false,
}: TransactionRowProps) {
  const color = tx.category?.color ?? FALLBACK_COLOR;
  const title = tx.memo?.trim() || tx.category?.name || "거래";
  const subtitle = [
    tx.category?.name ?? "미분류",
    showDate && formatDate(tx.date),
  ]
    .filter(Boolean)
    .join(" · ");

  const content = (
    <>
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
        <p className="truncate text-[12px] text-muted-foreground">{subtitle}</p>
      </div>

      <p
        className={`shrink-0 text-[15px] font-bold tabular-nums ${AMOUNT_COLOR[tx.type]}`}
      >
        {tx.type === "income" ? "+" : "-"}
        {formatAmount(tx.amount)}원
      </p>
    </>
  );

  const inner = "flex w-full items-center gap-3.25 pt-3.25 pb-3.5 text-left";

  return (
    <li className="border-b border-gray-100 last:border-b-0">
      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(tx)}
          className={`${inner} cursor-pointer`}
        >
          {content}
        </button>
      ) : (
        <div className={inner}>{content}</div>
      )}
    </li>
  );
}
