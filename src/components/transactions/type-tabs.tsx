"use client";

import { useSearchParams } from "next/navigation";
import { PillTab } from "@/components/common/pill-tab";
import { useSearchParamUpdater } from "@/hooks/use-search-param-updater";
import { TRANSACTION_TYPE_LABEL, TRANSACTION_TYPES } from "@/lib/constants";

const TABS = [
  { value: "all", label: "전체" },
  ...TRANSACTION_TYPES.map((t) => ({
    value: t,
    label: TRANSACTION_TYPE_LABEL[t],
  })),
];

export function TypeTabs() {
  const searchParams = useSearchParams();
  const setParam = useSearchParamUpdater();
  const current = searchParams.get("type") ?? "all";

  return (
    <div className="flex gap-2">
      {TABS.map((tab) => (
        <PillTab
          key={tab.value}
          active={current === tab.value}
          onClick={() =>
            setParam("type", tab.value === "all" ? null : tab.value)
          }
        >
          {tab.label}
        </PillTab>
      ))}
    </div>
  );
}
