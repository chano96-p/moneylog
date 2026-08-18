"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/common/icon";
import { copyBudgetsFromPreviousMonth } from "@/lib/actions/budgets";

export function CopyBudgetsButton({ month }: { month: string }) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      const { copied } = await copyBudgetsFromPreviousMonth(month);
      if (copied) {
        toast.success("지난달 예산을 불러왔어요.");
      } else {
        toast.info("지난달에 설정된 예산이 없어요.");
      }
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="flex h-8.5 cursor-pointer items-center gap-1.5 rounded-[10px] bg-white px-3.5 text-[13px] font-semibold text-gray-700 shadow-control disabled:opacity-60"
    >
      <Icon name="content_copy" size={16} />
      {pending ? "불러오는 중..." : "지난달 예산 불러오기"}
    </button>
  );
}
