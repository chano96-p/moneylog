"use client";

import { useSearchParams } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { useSearchParamUpdater } from "@/hooks/use-search-param-updater";
import { parsePeriodParam } from "@/lib/format";

const TABS = [
  { value: "monthly", label: "월간" },
  { value: "yearly", label: "연간" },
] as const;

/**
 * 보기 모드 전환 — 타입 필터(알약)와 층위가 다르므로 세그먼트 스타일.
 * 기간 전환은 서버 응답이 느려(집계 쿼리 다수) URL 구독만으로는
 * 트랜지션이 끝날 때까지 활성 표시가 안 바뀜 → useOptimistic으로
 * 클릭 즉시 바꾸고 응답 도착 시 URL 값과 자동 동기화.
 */
export function PeriodTabs() {
  const searchParams = useSearchParams();
  const setParam = useSearchParamUpdater();
  const urlPeriod = parsePeriodParam(searchParams.get("period") ?? undefined);
  const [current, setOptimistic] = useOptimistic(urlPeriod);
  const [, startTransition] = useTransition();

  return (
    <div className="flex gap-1 rounded-[10px] bg-gray-100 p-1">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          aria-pressed={current === tab.value}
          onClick={() =>
            startTransition(() => {
              setOptimistic(tab.value);
              setParam("period", tab.value === "monthly" ? null : tab.value);
            })
          }
          className={`h-6.5 cursor-pointer rounded-[7px] px-3 text-[13px] transition ${
            current === tab.value
              ? "bg-white font-bold text-foreground shadow-[0px_1px_1px_rgba(0,0,0,0.06)]"
              : "font-semibold text-muted-foreground"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
