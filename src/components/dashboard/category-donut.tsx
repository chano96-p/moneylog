"use client";

import { Cell, Pie, PieChart } from "recharts";

export type DonutSlice = {
  id: string;
  name: string;
  value: number;
  color: string;
};

export function CategoryDonut({ data }: { data: DonutSlice[] }) {
  return (
    <PieChart width={140} height={140}>
      <Pie
        data={data}
        dataKey="value"
        cx={70}
        cy={70}
        innerRadius={46}
        outerRadius={70}
        startAngle={90}
        endAngle={-270}
        paddingAngle={2}
        stroke="none"
        isAnimationActive={false}
      >
        {data.map((slice) => (
          <Cell key={slice.id} fill={slice.color} />
        ))}
      </Pie>
    </PieChart>
  );
}
