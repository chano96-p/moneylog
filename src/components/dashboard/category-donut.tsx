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
    <PieChart
      width={140}
      height={140}
      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      tabIndex={-1}
      className="**:outline-none"
    >
      <Pie
        data={data}
        dataKey="value"
        cx="50%"
        cy="50%"
        innerRadius={46}
        outerRadius={70}
        startAngle={90}
        endAngle={-270}
        paddingAngle={data.length > 1 ? 2 : 0}
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
