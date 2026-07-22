"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createTransaction } from "@/lib/actions/transactions";
import {
  MAX_TRANSACTION_AMOUNT,
  TRANSACTION_TYPE_LABEL,
  TRANSACTION_TYPES,
} from "@/lib/constants";
import { formatAmount, today } from "@/lib/format";
import { transactionInputSchema } from "@/lib/schemas";
import type { Category, TransactionType } from "@/lib/types";
import { DateField } from "../common/date-field";
import { Icon } from "../common/icon";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type TransactionFormModalProps = {
  categories: Category[];
};

export function TransactionFormModal({
  categories,
}: TransactionFormModalProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const [type, setType] = useState<TransactionType>("expense");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [memo, setMemo] = useState("");

  const visibleCategories = categories.filter((c) => c.type === type);

  function reset() {
    setType("expense");
    setCategoryId("");
    setAmount("");
    setDate(today());
    setMemo("");
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    setOpen(next);
  }

  async function handleSubmit() {
    const parsed = transactionInputSchema.safeParse({
      type,
      category_id: categoryId || null,
      amount: Number(amount),
      date,
      memo: memo.trim() || null,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setPending(true);
    try {
      await createTransaction(parsed.data);
      toast.success("거래를 추가했어요.");
      setOpen(false);
      reset();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1.5 rounded-[12px] bg-primary px-4 py-2.5 text-[14px] font-bold text-primary-foreground"
        >
          <Icon name="add" size={18} />
          거래 추가
        </button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="w-120 max-w-[calc(100%-2rem)] gap-5.5 rounded-3xl border-0 p-7 shadow-modal"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <DialogTitle className="text-[19px] font-extrabold text-foreground">
            거래 추가
          </DialogTitle>
          <button
            type="button"
            aria-label="닫기"
            onClick={() => handleOpenChange(false)}
            className="flex size-8.5 cursor-pointer items-center justify-center rounded-[10px] bg-secondary"
          >
            <Icon name="close" size={20} color="var(--gray-500)" />
          </button>
        </div>

        {/* 수입/지출 세그먼트 */}
        <div className="flex w-full gap-2 rounded-[12px] bg-gray-100 p-1">
          {TRANSACTION_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setCategoryId("");
              }}
              className={`flex-1 cursor-pointer rounded-[9px] p-2.5 text-[14px] transition ${
                type === t
                  ? "bg-white font-bold text-foreground shadow-[0px_1px_1px_rgba(0,0,0,0.06)]"
                  : "font-semibold text-muted-foreground"
              }`}
            >
              {TRANSACTION_TYPE_LABEL[t]}
            </button>
          ))}
        </div>

        {/* 금액 */}
        <div className="flex flex-col gap-2 pt-0.5">
          <p className="text-center text-[13px] font-semibold text-muted-foreground">
            금액
          </p>
          <div className="flex h-11.25 items-center justify-center">
            <span className="text-[36px] font-extrabold tracking-[-1.14px] text-gray-300">
              ₩&nbsp;
            </span>
            <input
              aria-label="금액"
              inputMode="numeric"
              placeholder="0"
              value={amount ? formatAmount(Number(amount)) : ""}
              onChange={(e) => {
                setAmount(
                  e.target.value
                    .replace(/[^\d]/g, "")
                    .slice(0, String(MAX_TRANSACTION_AMOUNT).length),
                );
              }}
              size={Math.max(formatAmount(Number(amount)).length, 1)}
              className="bg-transparent text-[36px] font-extrabold tracking-[-1.14px] text-foreground tabular-nums caret-primary outline-none placeholder:text-gray-300"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-0.5">
          {/* 카테고리 */}
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-gray-700">카테고리</p>
            <div className="flex flex-wrap gap-2">
              {visibleCategories.map((c) => {
                const selected = categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(c.id)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-md px-3.5 py-2.25 text-[13px] transition"
                    style={
                      selected
                        ? {
                            backgroundColor: `color-mix(in srgb, ${c.color} 10%, transparent)`,
                            color: c.color,
                            fontWeight: 700,
                          }
                        : {
                            backgroundColor: "var(--gray-100)",
                            color: "var(--gray-500)",
                            fontWeight: 600,
                          }
                    }
                  >
                    <Icon
                      name={c.icon}
                      size={17}
                      color={selected ? c.color : "var(--gray-500)"}
                    />
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 날짜 */}
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-gray-700">날짜</p>
            <DateField value={date} onChange={setDate} />
          </div>

          {/* 메모 */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="memo"
              className="text-[13px] font-bold text-gray-700"
            >
              메모
            </label>
            <input
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="점심 식사"
              className="w-full rounded-[12px] bg-background px-3.5 py-3.25 text-[14px] font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 placeholder:font-normal placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* 저장 */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending}
          className="w-full cursor-pointer rounded-lg bg-primary pt-4.25 pb-3.75 text-[15px] font-bold text-primary-foreground disabled:opacity-60"
        >
          {pending ? "저장 중..." : "저장하기"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
