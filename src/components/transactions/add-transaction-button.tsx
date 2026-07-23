"use client";

import { useState } from "react";
import { Icon } from "@/components/common/icon";
import { TransactionFormModal } from "@/components/transactions/transaction-form-modal";
import type { Category } from "@/lib/types";

export function AddTransactionButton({
  categories,
}: {
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex cursor-pointer items-center gap-1.5 rounded-[12px] bg-primary px-4 py-2.5 text-[14px] font-bold text-primary-foreground"
      >
        <Icon name="add" size={18} />
        거래 추가
      </button>

      <TransactionFormModal
        key={open ? "new" : "closed"} // 닫았다 열면 리셋
        categories={categories}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
