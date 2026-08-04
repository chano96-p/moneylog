import { format, parse } from "date-fns";
import { formatAmountShort } from "@/lib/format";
import type { MonthlyTotal } from "@/lib/queries/transactions";

export function MonthComparison({ totals }: { totals: MonthlyTotal[] }) {
  const max = Math.max(...totals.map((t) => t.total), 1);
  const last = totals.length - 1;

  return (
    <div className="flex flex-1 items-end justify-around gap-4 pt-2">
      {totals.map((t, i) => {
        const isCurrent = i === last;

        return (
          <div
            key={t.month}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <span
              className={`text-[12px] font-semibold tabular-nums ${
                isCurrent ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {formatAmountShort(t.total)}
            </span>
            <div className="flex h-25 w-full max-w-13 items-end">
              {t.total > 0 && (
                <div
                  className={`w-full rounded-sm ${isCurrent ? "bg-primary" : "bg-brand-lighter"}`}
                  style={{ height: `${Math.max((t.total / max) * 100, 6)}%` }}
                />
              )}
            </div>
            <span
              className={`text-[12px] ${
                isCurrent ? "font-bold text-primary" : "text-muted-foreground"
              }`}
            >
              {format(parse(t.month, "yyyy-MM", new Date()), "M월")}
            </span>
          </div>
        );
      })}
    </div>
  );
}
