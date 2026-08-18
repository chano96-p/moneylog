"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/common/icon";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { saveMonthlyBudget } from "@/lib/actions/budgets";
import { MAX_TRANSACTION_AMOUNT } from "@/lib/constants";
import { formatAmount } from "@/lib/format";
import { monthlyBudgetSchema } from "@/lib/schemas";

type TotalBudgetButtonProps = {
  month: string;
  current: number | null;
  categorySum: number;
};

export function TotalBudgetButton({
  month,
  current,
  categorySum,
}: TotalBudgetButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [amount, setAmount] = useState(current ? String(current) : "");

  async function submit(value: number | null) {
    const parsed = monthlyBudgetSchema.safeParse({ month, amount: value });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setPending(true);
    try {
      await saveMonthlyBudget(parsed.data);
      toast.success(
        value === null ? "총예산을 해제했어요." : "총예산을 저장했어요.",
      );
      setOpen(false);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setAmount(current ? String(current) : "");
          setOpen(true);
        }}
        className="flex h-8.5 cursor-pointer items-center gap-1.5 rounded-[10px] bg-white px-3.5 text-[13px] font-semibold text-gray-700 shadow-control"
      >
        <Icon name="tune" size={16} />
        {current === null ? "총예산 설정" : "총예산 수정"}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="w-105 max-w-[calc(100%-2rem)] gap-5.5 rounded-3xl border-0 p-7 shadow-modal"
        >
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[19px] font-extrabold text-foreground">
              이번 달 총예산
            </DialogTitle>
            <button
              type="button"
              aria-label="닫기"
              onClick={() => setOpen(false)}
              className="flex size-8.5 cursor-pointer items-center justify-center rounded-[10px] bg-secondary"
            >
              <Icon name="close" size={20} color="var(--gray-500)" />
            </button>
          </div>

          <div className="flex flex-col gap-2 pt-0.5">
            <p className="text-center text-[13px] font-semibold text-muted-foreground">
              한 달 지출 한도
            </p>
            <div className="flex h-11.25 items-center justify-center">
              <span className="text-[36px] font-extrabold tracking-[-1.14px] text-gray-300">
                ₩&nbsp;
              </span>
              <input
                aria-label="총예산"
                inputMode="numeric"
                placeholder="0"
                value={amount ? formatAmount(Number(amount)) : ""}
                onChange={(e) =>
                  setAmount(
                    e.target.value
                      .replace(/[^\d]/g, "")
                      .slice(0, String(MAX_TRANSACTION_AMOUNT).length),
                  )
                }
                size={Math.max(formatAmount(Number(amount)).length, 1)}
                className="bg-transparent text-[36px] font-extrabold tracking-[-1.14px] text-foreground tabular-nums caret-primary outline-none placeholder:text-gray-300"
              />
            </div>
          </div>

          <p className="rounded-[12px] bg-background px-3.5 py-3 text-[13px] text-muted-foreground">
            카테고리 예산 합계는{" "}
            <span className="font-bold text-foreground tabular-nums">
              {formatAmount(categorySum)}원
            </span>
            이에요. 총예산을 설정하면 예산 없는 카테고리 지출도 한도에 포함돼요.
          </p>

          {current === null ? (
            <button
              type="button"
              onClick={() => submit(Number(amount))}
              disabled={pending}
              className="w-full cursor-pointer rounded-lg bg-primary pt-4.25 pb-3.75 text-[15px] font-bold text-primary-foreground disabled:opacity-60"
            >
              {pending ? "저장 중..." : "저장하기"}
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => submit(null)}
                disabled={pending}
                className="cursor-pointer rounded-lg bg-secondary pt-4.25 pb-3.75 text-[15px] font-bold text-gray-700 transition disabled:opacity-60"
              >
                해제
              </button>
              <button
                type="button"
                onClick={() => submit(Number(amount))}
                disabled={pending}
                className="col-span-2 cursor-pointer rounded-lg bg-primary pt-4.25 pb-3.75 text-[15px] font-bold text-primary-foreground disabled:opacity-60"
              >
                {pending ? "저장 중..." : "저장하기"}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
