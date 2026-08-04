import { Icon } from "@/components/common/icon";
import type { CategoryTotal } from "@/lib/aggregate";
import { formatAmount } from "@/lib/format";
import type { TransactionType } from "@/lib/types";

type CategoryRankingProps = {
  totals: CategoryTotal[];
  previousTotals: Map<string, number>;
  type: TransactionType;
};

export function CategoryRanking({
  totals,
  previousTotals,
  type,
}: CategoryRankingProps) {
  const max = totals[0]?.total ?? 0;

  return (
    <section className="rounded-2xl bg-card p-6 shadow-card">
      <h2 className="text-[16px] font-bold text-foreground">카테고리 순위</h2>

      <ul className="mt-4 flex flex-col">
        {totals.map((item, i) => {
          const prev = previousTotals.get(item.id);
          const diffRatio = prev ? (item.total - prev) / prev : null;

          const percent =
            diffRatio === null ? null : Math.round(diffRatio * 100);
          const good =
            percent === null
              ? false
              : type === "income"
                ? percent > 0
                : percent < 0;

          return (
            <li
              key={item.id}
              className="flex items-center gap-3 border-b border-gray-100 py-3 last:border-b-0"
            >
              <span className="w-3 shrink-0 text-[13px] font-semibold text-muted-foreground tabular-nums">
                {i + 1}
              </span>

              <span
                className="flex size-7.5 shrink-0 items-center justify-center rounded-[9px]"
                style={{
                  backgroundColor: `color-mix(in srgb, ${item.color} 12%, transparent)`,
                }}
              >
                <Icon name={item.icon} size={17} color={item.color} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[13px] font-bold text-foreground">
                    {item.name}
                  </span>
                  <span className="shrink-0 text-[13px] font-bold text-foreground tabular-nums">
                    {formatAmount(item.total)}원
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${max > 0 ? (item.total / max) * 100 : 0}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>

              <span className="w-11 shrink-0 text-right text-[12px] font-bold tabular-nums">
                {percent === null || percent === 0 ? (
                  <span className="text-gray-300">—</span>
                ) : (
                  <span className={good ? "text-income" : "text-expense"}>
                    {percent > 0 ? "▲" : "▼"}
                    {Math.abs(percent)}%
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
