"use client";

import { format, parse } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { TRANSACTION_TYPE_LABEL } from "@/lib/constants";
import { formatAmount } from "@/lib/format";
import type { MonthlyTotal } from "@/lib/queries/transactions";

const SERIES = [
  { key: "income", color: "var(--income)" },
  { key: "expense", color: "var(--brand)" },
  { key: "saving", color: "var(--saving)" },
] as const;

type TypeTrendChartProps = {
  /** 세 배열 모두 같은 월 순서·같은 길이 */
  income: MonthlyTotal[];
  expense: MonthlyTotal[];
  saving: MonthlyTotal[];
};

/** 수입/지출/저축 3계열 묶은 막대 */
export function TypeTrendChart({
  income,
  expense,
  saving,
}: TypeTrendChartProps) {
  const data = income.map((inc, i) => ({
    label: format(parse(inc.month, "yyyy-MM", new Date()), "M월"),
    income: inc.total,
    expense: expense[i]?.total ?? 0,
    saving: saving[i]?.total ?? 0,
  }));

  return (
    <div className="h-55 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--gray-100)" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "var(--gray-500)" }}
          />
          <Tooltip
            cursor={{ fill: "var(--gray-50)" }}
            formatter={(value, name) => [
              `${formatAmount(Number(value ?? 0))}원`,
              TRANSACTION_TYPE_LABEL[
                name as keyof typeof TRANSACTION_TYPE_LABEL
              ],
            ]}
            labelStyle={{ fontWeight: 700, fontSize: 13 }}
            contentStyle={{
              borderRadius: 12,
              border: "none",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              fontSize: 13,
            }}
          />
          <Legend
            formatter={(name) =>
              TRANSACTION_TYPE_LABEL[
                name as keyof typeof TRANSACTION_TYPE_LABEL
              ]
            }
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12 }}
          />
          {SERIES.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              fill={s.color}
              radius={[3, 3, 0, 0]}
              maxBarSize={20}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
