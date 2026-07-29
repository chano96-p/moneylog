"use client";

import { addMonths, format, parse, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/common/icon";
import { currentMonthKST } from "@/lib/format";

export function MonthNav({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = parse(month, "yyyy-MM", new Date());
  const canGoNext = month < currentMonthKST();

  function move(next: Date) {
    const params = new URLSearchParams(searchParams);
    params.set("month", format(next, "yyyy-MM"));
    router.replace(`${pathname}?${params}`, { scroll: false });
  }

  const navBtn =
    "flex size-8.5 cursor-pointer items-center justify-center rounded-[10px] bg-white shadow-control disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="이전 달"
        onClick={() => move(subMonths(current, 1))}
        className={navBtn}
      >
        <Icon name="chevron_left" size={18} color="var(--gray-500)" />
      </button>

      <div className="flex h-8.5 items-center gap-1.5 rounded-[10px] bg-white px-3.5 shadow-control">
        <Icon name="calendar_month" size={16} color="var(--gray-500)" />
        <span className="text-[13px] font-bold text-foreground">
          {format(current, "yyyy년 M월", { locale: ko })}
        </span>
      </div>

      <button
        type="button"
        aria-label="다음 달"
        onClick={() => move(addMonths(current, 1))}
        disabled={!canGoNext}
        className={navBtn}
      >
        <Icon name="chevron_right" size={18} color="var(--gray-500)" />
      </button>
    </div>
  );
}
