"use client";

import { useState } from "react";
import { CategoryFormModal } from "@/components/categories/category-form-modal";
import { Icon } from "@/components/common/icon";
import type { TransactionType } from "@/lib/types";

export function AddCategoryButton({
  type,
  month,
}: {
  type: TransactionType;
  month: string;
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
        카테고리 추가
      </button>

      <CategoryFormModal
        key={open ? "new" : "closed"}
        open={open}
        onOpenChange={setOpen}
        type={type}
        month={month}
      />
    </>
  );
}
