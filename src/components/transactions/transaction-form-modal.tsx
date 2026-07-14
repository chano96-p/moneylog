"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createTransaction } from "@/lib/actions/transactions";
import { TRANSACTION_TYPE_LABEL, TRANSACTION_TYPES } from "@/lib/constants";
import { today } from "@/lib/format";
import { transactionInputSchema } from "@/lib/schemas";
import type { Category, TransactionType } from "@/lib/types";
import { DateField } from "../common/date-field";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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

  async function handleSubmit() {
    const parsed = transactionInputSchema.safeParse({
      type,
      category_id: categoryId || null,
      amount: Number(amount.replaceAll(",", "")),
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>거래 입력</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>거래 입력</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 수입/지출 토글 */}
          <div className="grid grid-cols-2 gap-2">
            {TRANSACTION_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  setCategoryId(""); // 타입 바뀌면 카테고리 초기화
                }}
                className={`rounded-xl py-2.5 text-sm font-medium transition ${
                  type === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {TRANSACTION_TYPE_LABEL[t]}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">금액</Label>
            <Input
              id="amount"
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, "");
                setAmount(raw ? Number(raw).toLocaleString("ko-KR") : "");
              }}
              className="tabular-nums"
            />
          </div>

          <div className="space-y-2">
            <Label>카테고리</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="선택해 주세요" />
              </SelectTrigger>
              <SelectContent>
                {visibleCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">날짜</Label>
            <DateField value={date} onChange={setDate} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo">메모 (선택)</Label>
            <Input
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 점심 식사"
            />
          </div>

          <Button onClick={handleSubmit} disabled={pending} className="w-full">
            {pending ? "저장 중..." : "저장"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
