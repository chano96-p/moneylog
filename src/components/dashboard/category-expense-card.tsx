import Link from "next/link";
import { Icon } from "@/components/common/icon";
import { formatAmount, formatAmountShort } from "@/lib/format";
import type { TransactionWithCategory } from "@/lib/types";
import { CategoryDonut, type DonutSlice } from "./category-donut";

const FALLBACK = {
  name: "미분류",
  color: "var(--gray-500)",
  icon: "help",
};
const MAX_SLICES = 6;

/** 합이 정확히 100이 되도록 배분 (최대잔차법) */
function toPercents(values: number[], total: number) {
  if (total <= 0) return values.map(() => 0);

  const raw = values.map((v) => (v / total) * 100);
  const result = raw.map(Math.floor);
  let remainder = 100 - result.reduce((a, b) => a + b, 0);

  // 소수부가 큰 순서로 1%씩 나눠줌
  const byFraction = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);

  for (const { i } of byFraction) {
    if (remainder <= 0) break;
    result[i] += 1;
    remainder -= 1;
  }
  return result;
}

function aggregate(transactions: TransactionWithCategory[]) {
  const map = new Map<string, DonutSlice & { icon: string }>();

  for (const tx of transactions) {
    if (tx.type !== "expense") continue;
    const key = tx.category_id ?? "none";
    const prev = map.get(key);
    if (prev) {
      prev.value += tx.amount;
    } else {
      map.set(key, {
        id: key,
        name: tx.category?.name ?? FALLBACK.name,
        color: tx.category?.color ?? FALLBACK.color,
        icon: tx.category?.icon ?? FALLBACK.icon,
        value: tx.amount,
      });
    }
  }

  const sorted = [...map.values()].sort((a, b) => b.value - a.value);
  if (sorted.length <= MAX_SLICES) return sorted;

  // 상위 5개 + 나머지를 '기타'로 합침
  const top = sorted.slice(0, MAX_SLICES - 1);
  const rest = sorted.slice(MAX_SLICES - 1);
  return [
    ...top,
    {
      id: "etc",
      name: "기타",
      color: "var(--gray-400)",
      icon: "more_horiz",
      value: rest.reduce((sum, s) => sum + s.value, 0),
    },
  ];
}

export function CategoryExpenseCard({
  transactions,
}: {
  transactions: TransactionWithCategory[];
}) {
  const slices = aggregate(transactions);
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const percents = toPercents(
    slices.map((s) => s.value),
    total,
  );

  return (
    <section className="flex flex-col rounded-2xl bg-card p-6 shadow-card">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-foreground">
          카테고리별 지출
        </h2>
        <Link
          href="/reports"
          className="flex items-center gap-0.5 text-[13px] font-semibold text-muted-foreground hover:text-gray-700"
        >
          리포트
          <Icon name="chevron_right" size={16} color="currentColor" />
        </Link>
      </div>

      {total === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-14">
          <Icon name="donut_small" size={36} color="var(--gray-300)" />
          <p className="text-[14px] font-medium text-muted-foreground">
            이번 달 지출이 없어요
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4.5 mb-4.5 flex items-center gap-5.5">
            {/* 도넛 + 중앙 라벨 */}
            <div className="relative size-35 shrink-0">
              <CategoryDonut data={slices} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  총 지출
                </span>
                <span className="text-[17px] font-extrabold text-foreground tabular-nums">
                  {formatAmountShort(total)}
                </span>
              </div>
            </div>

            {/* 범례 */}
            <ul className="flex min-w-0 flex-1 flex-col gap-2.75">
              {slices.map((slice, i) => (
                <li key={slice.id} className="flex items-center gap-2">
                  <span
                    className="size-2.25 shrink-0 rounded-[3px]"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-gray-700">
                    {slice.name}
                  </span>
                  <span className="shrink-0 text-[13px] font-bold text-foreground tabular-nums">
                    {formatAmount(slice.value)}
                  </span>
                  <span className="w-8.5 shrink-0 text-right text-[13px] text-muted-foreground tabular-nums">
                    {percents[i]}%
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 푸터: 가장 많이 쓴 카테고리 */}
          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4.5">
            <p className="text-[13px] text-muted-foreground">
              가장 많이 쓴 카테고리
            </p>
            <div className="flex items-center gap-2">
              <span
                className="flex size-6.5 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `color-mix(in srgb, ${slices[0].color} 12%, transparent)`,
                }}
              >
                <Icon name={slices[0].icon} size={15} color={slices[0].color} />
              </span>
              <span className="text-[13px] font-bold text-foreground">
                {slices[0].name} · {formatAmount(slices[0].value)}원
              </span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
