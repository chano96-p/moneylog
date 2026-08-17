"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createRecurringRule,
  deleteRecurringRule,
  updateRecurringRule,
} from "@/lib/actions/recurring";
import {
  MAX_TRANSACTION_AMOUNT,
  TRANSACTION_TYPE_LABEL,
  TRANSACTION_TYPES,
} from "@/lib/constants";
import { formatAmount } from "@/lib/format";
import {
  type RecurringRuleInput,
  type RecurringRuleUpdateInput,
  recurringRuleInputSchema,
  recurringRuleUpdateSchema,
} from "@/lib/schemas";
import type {
  Category,
  RecurringRuleWithCategory,
  TransactionType,
} from "@/lib/types";
import { Icon } from "../common/icon";
import { CategoryPickerModal } from "../transactions/category-picker-modal";

const VISIBLE_CHIPS = 3;
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

type RecurringRuleFormModalProps = {
  categories: Category[];
  rule?: RecurringRuleWithCategory; // 있으면 수정 모드
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RecurringRuleFormModal({
  categories,
  rule,
  open,
  onOpenChange,
}: RecurringRuleFormModalProps) {
  const isEdit = !!rule;

  const [pending, setPending] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [type, setType] = useState<TransactionType>(rule?.type ?? "expense");
  const [categoryId, setCategoryId] = useState(rule?.category_id ?? "");
  const [amount, setAmount] = useState(rule ? String(rule.amount) : "");
  const [dayOfMonth, setDayOfMonth] = useState(rule?.day_of_month ?? 1);
  const [memo, setMemo] = useState(rule?.memo ?? "");
  const [isActive, setIsActive] = useState(rule?.is_active ?? true);
  const [pickerOpen, setPickerOpen] = useState(false);

  const visibleCategories = categories.filter((c) => c.type === type);

  const selected = visibleCategories.find((c) => c.id === categoryId);
  const chips = (() => {
    const head = visibleCategories.slice(0, VISIBLE_CHIPS);
    if (selected && !head.some((c) => c.id === selected.id)) {
      return [selected, ...head.slice(0, VISIBLE_CHIPS - 1)];
    }
    return head;
  })();
  const hasMore = visibleCategories.length > chips.length;

  async function handleSubmit() {
    const base = {
      type,
      category_id: categoryId || null,
      amount: Number(amount),
      day_of_month: dayOfMonth,
      memo: memo.trim() || null,
    };

    const parsed = isEdit
      ? recurringRuleUpdateSchema.safeParse({
          ...base,
          id: rule.id,
          is_active: isActive,
        })
      : recurringRuleInputSchema.safeParse(base);

    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setPending(true);
    try {
      if (isEdit) {
        await updateRecurringRule(parsed.data as RecurringRuleUpdateInput);
        toast.success("반복 거래를 수정했어요.");
      } else {
        const { warning } = await createRecurringRule(
          parsed.data as RecurringRuleInput,
        );
        if (warning) {
          toast.warning(warning);
        } else {
          toast.success("반복 거래를 등록했어요. 이번 달 거래도 추가됐어요.");
        }
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
    if (!rule) return;
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setPending(true);
    try {
      await deleteRecurringRule(rule.id);
      toast.success("반복 거래를 삭제했어요.");
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
        <div className="flex items-center justify-between">
          <DialogTitle className="text-[19px] font-extrabold text-foreground">
            {isEdit ? "반복 거래 수정" : "반복 거래 등록"}
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

        {/* 지출/수입/저축 세그먼트 */}
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
            매월 금액
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
              {chips.map((c) => {
                const isSelected = categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(c.id)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-md px-3.5 py-2.25 text-[13px] transition"
                    style={
                      isSelected
                        ? {
                            backgroundColor: `color-mix(in srgb, ${c.color} 10%, transparent)`,
                            color: c.color,
                            fontWeight: 700,
                          }
                        : {
                            backgroundColor: "var(--gray-50)",
                            color: "var(--gray-500)",
                            fontWeight: 600,
                          }
                    }
                  >
                    <Icon
                      name={c.icon}
                      size={17}
                      color={isSelected ? c.color : "var(--gray-500)"}
                    />
                    {c.name}
                  </button>
                );
              })}

              {hasMore && (
                <button
                  type="button"
                  aria-label="카테고리 더 보기"
                  onClick={() => setPickerOpen(true)}
                  className="flex cursor-pointer items-center rounded-md bg-gray-50 px-3.5 py-2.25 text-gray-500 transition hover:bg-secondary"
                >
                  <Icon name="more_horiz" size={17} color="currentColor" />
                </button>
              )}
            </div>

            <CategoryPickerModal
              open={pickerOpen}
              onOpenChange={setPickerOpen}
              categories={visibleCategories}
              selectedId={categoryId}
              onSelect={setCategoryId}
            />
          </div>

          {/* 매월 며칠 */}
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-gray-700">반복 날짜</p>
            <div className="flex items-center gap-2 text-[14px] font-semibold text-foreground">
              매월
              <Select
                value={String(dayOfMonth)}
                onValueChange={(v) => setDayOfMonth(Number(v))}
              >
                <SelectTrigger className="h-10 w-24 cursor-pointer rounded-[12px] border-0 bg-background px-3.5 text-[14px] font-semibold text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {DAYS.map((d) => (
                    <SelectItem
                      key={d}
                      value={String(d)}
                      className="text-[13px]"
                    >
                      {d}일
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {dayOfMonth >= 29 && (
                <span className="text-[12px] font-normal text-muted-foreground">
                  짧은 달은 말일에 기록돼요
                </span>
              )}
            </div>
          </div>

          {/* 메모 */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="recurring-memo"
              className="text-[13px] font-bold text-gray-700"
            >
              메모
            </label>
            <input
              id="recurring-memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="월세"
              className="w-full rounded-[12px] bg-background px-3.5 py-3.25 text-[14px] font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 placeholder:font-normal placeholder:text-gray-400"
            />
          </div>

          {/* 활성 토글 + 안내 — 수정 시에만 */}
          {isEdit && (
            <>
              <label className="flex cursor-pointer items-center justify-between rounded-[12px] bg-background px-3.5 py-3">
                <span className="text-[14px] font-semibold text-foreground">
                  다음 달부터 자동 생성
                </span>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="size-4.5 cursor-pointer accent-primary"
                />
              </label>
              <p className="text-[12px] text-muted-foreground">
                수정·삭제해도 이미 기록된 거래는 그대로 남아요. 이번 달 거래를
                바꾸려면 거래 내역에서 직접 수정해 주세요.
              </p>
            </>
          )}
        </div>

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
            {pending ? "저장 중..." : "등록하기"}
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}
