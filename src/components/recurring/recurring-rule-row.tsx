import { AMOUNT_COLOR, TRANSACTION_TYPE_LABEL } from "@/lib/constants";
import { formatAmount } from "@/lib/format";
import type { RecurringRuleWithCategory } from "@/lib/types";
import { Icon } from "../common/icon";

const FALLBACK_COLOR = "var(--cat-etc)";

type RecurringRuleRowProps = {
  rule: RecurringRuleWithCategory;
  onSelect: (rule: RecurringRuleWithCategory) => void;
};

export function RecurringRuleRow({ rule, onSelect }: RecurringRuleRowProps) {
  const color = rule.category?.color ?? FALLBACK_COLOR;
  const title = rule.memo?.trim() || rule.category?.name || "반복 거래";
  const subtitle = [
    `매월 ${rule.day_of_month}일`,
    TRANSACTION_TYPE_LABEL[rule.type],
    rule.category?.name ?? "미분류",
  ].join(" · ");

  return (
    <li className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => onSelect(rule)}
        className={`flex w-full cursor-pointer items-center gap-3.25 pt-3.25 pb-3.5 text-left ${
          rule.is_active ? "" : "opacity-50"
        }`}
      >
        <div
          className="flex size-10.5 shrink-0 items-center justify-center rounded-[13px]"
          style={{
            backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
          }}
        >
          <Icon name={rule.category?.icon ?? "help"} size={21} color={color} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-[14px] font-bold text-foreground">
            {title}
            {!rule.is_active && (
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-500">
                중지됨
              </span>
            )}
          </p>
          <p className="truncate text-[12px] text-muted-foreground">
            {subtitle}
          </p>
        </div>

        <p
          className={`shrink-0 text-[15px] font-bold tabular-nums ${AMOUNT_COLOR[rule.type]}`}
        >
          {rule.type === "income" ? "+" : "-"}
          {formatAmount(rule.amount)}원
        </p>
      </button>
    </li>
  );
}
