import { Icon } from "@/components/common/icon";
import { formatAmount } from "@/lib/format";
import type { Category } from "@/lib/types";

export function BudgetRow({
  category,
  spent,
  budget,
}: {
  category: Category;
  spent: number;
  budget: number;
}) {
  const ratio = budget > 0 ? spent / budget : 0;
  const remaining = budget - spent;
  const over = remaining < 0;

  return (
    <li className="flex items-center gap-3.5 border-b border-gray-100 py-4 last:border-b-0">
      <span
        className="flex size-9.5 shrink-0 items-center justify-center rounded-[12px]"
        style={{
          backgroundColor: `color-mix(in srgb, ${category.color} 12%, transparent)`,
        }}
      >
        <Icon name={category.icon} size={20} color={category.color} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[14px] font-bold text-foreground">
            {category.name}
          </span>
          <span className="shrink-0 text-[13px] font-semibold text-muted-foreground tabular-nums">
            {formatAmount(spent)} / {formatAmount(budget)}원
          </span>
        </div>

        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(ratio, 1) * 100}%`,
              backgroundColor: over ? "var(--expense)" : category.color,
            }}
          />
        </div>
      </div>

      <span
        className={`w-16 shrink-0 text-right text-[13px] font-bold tabular-nums ${
          over ? "text-expense" : "text-muted-foreground"
        }`}
      >
        {over ? "초과" : `${formatAmount(remaining)}`}
      </span>
    </li>
  );
}
