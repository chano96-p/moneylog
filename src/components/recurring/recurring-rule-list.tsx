"use client";

import { useState } from "react";
import type { Category, RecurringRuleWithCategory } from "@/lib/types";
import { RecurringRuleFormModal } from "./recurring-rule-form-modal";
import { RecurringRuleRow } from "./recurring-rule-row";

export function RecurringRuleList({
  rules,
  categories,
}: {
  rules: RecurringRuleWithCategory[];
  categories: Category[];
}) {
  const [editing, setEditing] = useState<RecurringRuleWithCategory | null>(
    null,
  );

  return (
    <>
      <ul>
        {rules.map((rule) => (
          <RecurringRuleRow key={rule.id} rule={rule} onSelect={setEditing} />
        ))}
      </ul>

      <RecurringRuleFormModal
        key={editing?.id ?? "closed"} // 행 바뀌면 폼 리셋
        categories={categories}
        rule={editing ?? undefined}
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      />
    </>
  );
}
