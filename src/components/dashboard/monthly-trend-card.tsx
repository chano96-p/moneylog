"use client";

import { format, parse } from "date-fns";
import { useId, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { formatAmount } from "@/lib/format";
import type { MonthlyTotal } from "@/lib/queries/transactions";

const RANGES = [
  { value: 6, label: "6개월" },
  { value: 12, label: "1년" },
] as const;

export function MonthlyTrendCard({ totals }: { totals: MonthlyTotal[] }) {
  const [range, setRange] = useState<number>(6);

  const gradientId = useId();

  const data = totals.slice(-range).map((t) => ({
    ...t,
    label: format(parse(t.month, "yyyy-MM", new Date()), "M월"),
  }));

  const recorded = data.filter((d) => d.total > 0);
  const average = recorded.length
    ? Math.round(
        recorded.reduce((sum, d) => sum + d.total, 0) / recorded.length,
      )
    : 0;

  const rangeLabel =
    RANGES.find((r) => r.value === range)?.label ?? `${range}개월`;

  return (
    <section className="rounded-2xl bg-card p-6 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-foreground">
            월별 지출 추이
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {recorded.length > 0 ? (
              <>
                기록된 {recorded.length}개월 월 평균{" "}
                <span className="font-bold text-gray-700">
                  {formatAmount(average)}원
                </span>
              </>
            ) : (
              "아직 기록된 지출이 없어요"
            )}
          </p>
        </div>

        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRange(r.value)}
              className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-[12px] transition ${
                range === r.value
                  ? "bg-brand-light font-bold text-primary"
                  : "font-semibold text-muted-foreground hover:bg-gray-50"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div
        role="img"
        aria-label={`최근 ${rangeLabel} 월별 지출 추이. 기록된 ${recorded.length}개월 평균 ${formatAmount(average)}원`}
        className="mt-5 h-45 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="var(--gray-100)" />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--gray-500)" }}
              dy={8}
              interval="preserveStartEnd"
            />

            <Tooltip
              cursor={{ stroke: "var(--gray-200)", strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const { label, total } = payload[0].payload;
                return (
                  <div className="rounded-lg bg-gray-900 px-2.5 py-1.5 text-[12px] text-white shadow-popover">
                    <span className="font-semibold text-gray-300">{label}</span>{" "}
                    <span className="font-bold tabular-nums">
                      {formatAmount(total)}원
                    </span>
                  </div>
                );
              }}
            />

            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--brand)"
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 4,
                fill: "var(--brand)",
                stroke: "white",
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
