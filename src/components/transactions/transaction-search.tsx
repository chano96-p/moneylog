"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/common/icon";
import { useSearchParamUpdater } from "@/hooks/use-search-param-updater";

export function TransactionSearch({ initial }: { initial: string }) {
  const setParam = useSearchParamUpdater();
  const [value, setValue] = useState(initial);

  useEffect(() => {
    // 이미 반영된 값이면 라우팅 건너뜀 (뒤로가기 등으로 initial이 바뀐 경우)
    if (value.trim() === initial) return;

    const timer = setTimeout(() => {
      setParam("q", value.trim() || null);
    }, 400);

    return () => clearTimeout(timer);
  }, [value, initial, setParam]);

  return (
    <div className="flex h-9 w-56 items-center gap-2 rounded-[12px] bg-white px-3.5 shadow-control">
      <Icon name="search" size={17} color="var(--gray-400)" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="메모 검색"
        aria-label="메모 검색"
        className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-gray-400"
      />
      {value && (
        <button
          type="button"
          aria-label="검색어 지우기"
          onClick={() => setValue("")}
          className="cursor-pointer text-gray-400 hover:text-gray-500"
        >
          <Icon name="close" size={15} color="currentColor" />
        </button>
      )}
    </div>
  );
}
