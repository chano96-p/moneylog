"use client";

import { PillTab } from "@/components/common/pill-tab";
import { useSearchParamUpdater } from "@/hooks/use-search-param-updater";
import { TRANSACTION_TYPE_LABEL, TRANSACTION_TYPES } from "@/lib/constants";
import type { TransactionType } from "@/lib/types";

export function ReportTypeTabs({ current }: { current: TransactionType }) {
  const setParam = useSearchParamUpdater();

  return (
    <div className="flex gap-2">
      {TRANSACTION_TYPES.map((t) => (
        <PillTab
          key={t}
          active={current === t}
          onClick={() => setParam("type", t === "expense" ? null : t)}
        >
          {TRANSACTION_TYPE_LABEL[t]}
        </PillTab>
      ))}
    </div>
  );
}
