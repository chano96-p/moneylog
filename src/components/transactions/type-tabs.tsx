"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TRANSACTION_TYPE_LABEL } from "@/lib/constants";

const TABS = [
  { value: "all", label: "전체" },
  { value: "income", label: TRANSACTION_TYPE_LABEL.income },
  { value: "expense", label: TRANSACTION_TYPE_LABEL.expense },
] as const;

export function TypeTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("type") ?? "all";

  function select(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value === "all")
      params.delete("type"); // 기본값은 URL에서 제거
    else params.set("type", value);
    router.replace(`${pathname}?${params}`, { scroll: false });
  }

  return (
    <div className="flex gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => select(tab.value)}
          className={`h-8 w-14 cursor-pointer rounded-full text-[13px] transition ${
            current === tab.value
              ? "bg-gray-900 font-bold text-white"
              : "bg-white font-semibold text-gray-700 shadow-control"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
