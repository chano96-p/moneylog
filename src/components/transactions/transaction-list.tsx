"use client";

import { useState } from "react";
import { TransactionFormModal } from "@/components/transactions/transaction-form-modal";
import { TransactionGroup } from "@/components/transactions/transaction-group";
import type { Category, TransactionWithCategory } from "@/lib/types";

export function TransactionList({
  groups,
  categories,
}: {
  groups: [string, TransactionWithCategory[]][];
  categories: Category[];
}) {
  const [editing, setEditing] = useState<TransactionWithCategory | null>(null);

  return (
    <>
      {groups.map(([date, txs]) => (
        <TransactionGroup
          key={date}
          date={date}
          transactions={txs}
          onSelect={setEditing}
        />
      ))}

      <TransactionFormModal
        key={editing?.id ?? "closed"} // 🔑 행 바뀌면 폼 리셋
        categories={categories}
        transaction={editing ?? undefined}
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      />
    </>
  );
}
