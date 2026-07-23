"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/lib/actions/transactions";
import {
  MAX_TRANSACTION_AMOUNT,
  TRANSACTION_TYPE_LABEL,
  TRANSACTION_TYPES,
} from "@/lib/constants";
import { formatAmount, today } from "@/lib/format";
import {
  type TransactionInput,
  type TransactionUpdateInput,
  transactionInputSchema,
  transactionUpdateSchema,
} from "@/lib/schemas";
import type {
  Category,
  TransactionType,
  TransactionWithCategory,
} from "@/lib/types";
import { DateField } from "../common/date-field";
import { Icon } from "../common/icon";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

type TransactionFormModalProps = {
  categories: Category[];
  transaction?: TransactionWithCategory; // 있으면 수정 모드
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TransactionFormModal({
  categories,
  transaction,
  open,
  onOpenChange,
}: TransactionFormModalProps) {
  const isEdit = !!transaction;

  const [pending, setPending] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [type, setType] = useState<TransactionType>(
    transaction?.type ?? "expense",
  );
  const [categoryId, setCategoryId] = useState(transaction?.category_id ?? "");
  const [amount, setAmount] = useState(
    transaction ? String(transaction.amount) : "",
  );
  const [date, setDate] = useState(transaction?.date ?? today());
  const [memo, setMemo] = useState(transaction?.memo ?? "");

  const visibleCategories = categories.filter((c) => c.type === type);

  async function handleSubmit() {
    const base = {
      type,
      category_id: categoryId || null,
      amount: Number(amount),
      date,
      memo: memo.trim() || null,
    };

    const parsed = isEdit
      ? transactionUpdateSchema.safeParse({ ...base, id: transaction.id })
      : transactionInputSchema.safeParse(base);

    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setPending(true);
    try {
      if (isEdit) {
        await updateTransaction(parsed.data as TransactionUpdateInput);
        toast.success("거래를 수정했어요.");
      } else {
        await createTransaction(parsed.data as TransactionInput);
        toast.success("거래를 추가했어요.");
      }
      onOpenChange(false);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!transaction) return;
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setPending(true);
    try {
      await deleteTransaction(transaction.id);
      toast.success("거래를 삭제했어요.");
      onOpenChange(false);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setPending(false);
    }
  }

  function disarmDelete() {
    if (confirmingDelete) setConfirmingDelete(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClick={disarmDelete}
        showCloseButton={false}
        className="w-120 max-w-[calc(100%-2rem)] gap-5.5 rounded-3xl border-0 p-7 shadow-modal"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <DialogTitle className="text-[19px] font-extrabold text-foreground">
            {isEdit ? "거래 수정" : "거래 추가"}
          </DialogTitle>
          <button
            type="button"
            aria-label="닫기"
            onClick={() => onOpenChange(false)}
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
        {isEdit ? (
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={pending}
              className={`cursor-pointer rounded-lg pt-4.25 pb-3.75 text-[15px] font-bold transition disabled:opacity-60 ${
                confirmingDelete
                  ? "bg-expense text-white"
                  : "bg-expense-bg text-expense"
              }`}
            >
              {confirmingDelete ? "정말 삭제" : "삭제"}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={pending}
              className="col-span-2 cursor-pointer rounded-lg bg-primary pt-4.25 pb-3.75 text-[15px] font-bold text-primary-foreground disabled:opacity-60"
            >
              {pending ? "저장 중..." : "저장하기"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pending}
            className="w-full cursor-pointer rounded-lg bg-primary pt-4.25 pb-3.75 text-[15px] font-bold text-primary-foreground disabled:opacity-60"
          >
            {pending ? "저장 중..." : "저장하기"}
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}
