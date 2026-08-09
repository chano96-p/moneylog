"use client";

import { addMonths, format, parse, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { useState } from "react";
import { Icon } from "@/components/common/icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSearchParamUpdater } from "@/hooks/use-search-param-updater";
import { currentMonthKST } from "@/lib/format";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export function MonthNav({
  month,
  maxMonth,
}: {
  month: string;
  maxMonth?: string;
}) {
  const setParam = useSearchParamUpdater();
  const [open, setOpen] = useState(false);

  const current = parse(month, "yyyy-MM", new Date());
  const limit = maxMonth ?? currentMonthKST();
  const canGoNext = month < limit;

  // 피커에서 보고 있는 연도 (선택된 월의 연도로 시작)
  const [year, setYear] = useState(current.getFullYear());

  function move(next: Date) {
    setParam("month", format(next, "yyyy-MM"));
  }

  function handleOpenChange(next: boolean) {
    if (next) setYear(current.getFullYear()); // 열 때마다 현재 값 기준으로 초기화
    setOpen(next);
  }

  function selectMonth(m: number) {
    setParam("month", `${year}-${String(m).padStart(2, "0")}`);
    setOpen(false);
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

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-8.5 cursor-pointer items-center gap-1.5 rounded-[10px] bg-white px-3.5 shadow-control"
          >
            <Icon name="calendar_month" size={16} color="var(--gray-500)" />
            <span className="text-[13px] font-bold text-foreground">
              {format(current, "yyyy년 M월", { locale: ko })}
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="center"
          className="w-64 rounded-2xl border-0 p-4 shadow-popover"
        >
          {/* 연도 이동 */}
          <div className="flex items-center justify-between pb-3">
            <button
              type="button"
              aria-label="이전 해"
              onClick={() => setYear(year - 1)}
              className="flex size-7 cursor-pointer items-center justify-center rounded-lg hover:bg-gray-50"
            >
              <Icon name="chevron_left" size={16} color="var(--gray-500)" />
            </button>

            <span className="text-[14px] font-bold text-foreground tabular-nums">
              {year}년
            </span>

            <button
              type="button"
              aria-label="다음 해"
              onClick={() => setYear(year + 1)}
              disabled={`${year + 1}-01` > limit}
              className="flex size-7 cursor-pointer items-center justify-center rounded-lg hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Icon name="chevron_right" size={16} color="var(--gray-500)" />
            </button>
          </div>

          {/* 12개월 그리드 */}
          <div className="grid grid-cols-3 gap-1.5">
            {MONTHS.map((m) => {
              const value = `${year}-${String(m).padStart(2, "0")}`;
              const selected = value === month;
              const disabled = value > limit;

              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => selectMonth(m)}
                  disabled={disabled}
                  aria-pressed={selected}
                  className={`cursor-pointer rounded-[10px] py-2 text-[13px] transition ${
                    selected
                      ? "bg-primary font-bold text-primary-foreground"
                      : disabled
                        ? "cursor-not-allowed text-gray-300"
                        : "font-semibold text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {m}월
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

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
