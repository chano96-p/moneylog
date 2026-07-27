"use client";

import { format, parse, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseDate, todayKST } from "@/lib/format";

function recentMonths(count: number) {
  const now = parseDate(todayKST());
  return Array.from({ length: count }, (_, i) => {
    const d = subMonths(now, i);
    return {
      value: format(d, "yyyy-MM"),
      label: format(d, "yyyy년 M월", { locale: ko }),
    };
  });
}

export function MonthSelect({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const months = recentMonths(12);

  if (!months.some((m) => m.value === month)) {
    months.push({
      value: month,
      label: format(parse(month, "yyyy-MM", new Date()), "yyyy년 M월", {
        locale: ko,
      }),
    });
  }

  function select(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set("month", value);
    router.replace(`${pathname}?${params}`, { scroll: false });
  }

  return (
    <Select value={month} onValueChange={select}>
      <SelectTrigger className="h-8.5 w-auto cursor-pointer gap-1.5 rounded-[10px] border-0 bg-white px-3.5 text-[13px] font-semibold text-gray-700 shadow-control">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {months.map((m) => (
          <SelectItem key={m.value} value={m.value} className="text-[13px]">
            {m.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
