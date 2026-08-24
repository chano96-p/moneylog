"use client";

import { Icon } from "@/components/common/icon";
import { useSearchParamUpdater } from "@/hooks/use-search-param-updater";
import { currentMonthKST } from "@/lib/format";

/**
 * 연도 이동 — month 파라미터의 연 부분만 바꾼다 (월간 뷰로 돌아가도 보던 해 유지).
 * 다음 해로 갈 때 미래 월이 되면 이번 달로 클램프.
 */
export function YearNav({ month }: { month: string }) {
  const setParam = useSearchParamUpdater();

  const currentMonth = currentMonthKST();
  const [year, mm] = month.split("-");
  const maxYear = Number(currentMonth.slice(0, 4));
  const canGoNext = Number(year) < maxYear;

  function go(delta: number) {
    const target = `${Number(year) + delta}-${mm}`;
    setParam("month", target > currentMonth ? currentMonth : target);
  }

  return (
    <div className="flex items-center gap-1 rounded-[10px] bg-white px-1 shadow-control">
      <button
        type="button"
        aria-label="이전 해"
        onClick={() => go(-1)}
        className="flex size-8.5 cursor-pointer items-center justify-center text-gray-500 hover:text-gray-700"
      >
        <Icon name="chevron_left" size={20} color="currentColor" />
      </button>
      <span className="min-w-16 text-center text-[13px] font-semibold text-gray-700 tabular-nums">
        {year}년
      </span>
      <button
        type="button"
        aria-label="다음 해"
        onClick={() => go(1)}
        disabled={!canGoNext}
        className="flex size-8.5 cursor-pointer items-center justify-center text-gray-500 hover:text-gray-700 disabled:cursor-default disabled:opacity-30"
      >
        <Icon name="chevron_right" size={20} color="currentColor" />
      </button>
    </div>
  );
}
