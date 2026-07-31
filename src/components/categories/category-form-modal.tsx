"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/common/icon";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  MAX_TRANSACTION_AMOUNT,
} from "@/lib/constants";
import { formatAmount } from "@/lib/format";
import { categoryInputSchema, categoryUpdateSchema } from "@/lib/schemas";
import type { Category, TransactionType } from "@/lib/types";

const FIELD =
  "w-full rounded-[12px] bg-background px-3.5 py-3.25 text-[14px] font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-ring/50";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: TransactionType; // 추가 시 현재 탭의 타입
  month: string; // 예산 적용 월
  category?: Category; // 있으면 수정
  currentBudget?: number | null;
};

export function CategoryFormModal({
  open,
  onOpenChange,
  type,
  month,
  category,
  currentBudget,
}: Props) {
  const isEdit = !!category;
  const [pending, setPending] = useState(false);

  const [name, setName] = useState(category?.name ?? "");
  const [icon, setIcon] = useState(category?.icon ?? CATEGORY_ICONS[0]);
  const [color, setColor] = useState<string>(
    category?.color ?? CATEGORY_COLORS[0],
  );
  const [budget, setBudget] = useState(
    currentBudget ? String(currentBudget) : "",
  );

  async function handleSubmit() {
    const base = {
      name,
      icon,
      color,
      month,
      budget: budget ? Number(budget) : null,
    };

    setPending(true);
    try {
      if (isEdit) {
        const parsed = categoryUpdateSchema.safeParse({
          ...base,
          id: category.id,
        });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        await updateCategory(parsed.data);
        toast.success("카테고리를 수정했어요.");
      } else {
        const parsed = categoryInputSchema.safeParse({ ...base, type });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        await createCategory(parsed.data);
        toast.success("카테고리를 추가했어요.");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-120 max-w-[calc(100%-2rem)] gap-5.5 rounded-3xl border-0 p-7 shadow-modal"
      >
        <div className="flex items-center justify-between">
          <DialogTitle className="text-[19px] font-extrabold text-foreground">
            {isEdit ? "카테고리 수정" : "카테고리 추가"}
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

        {/* 미리보기 */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-14.5 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
            }}
          >
            <Icon name={icon} size={30} color={color} />
          </div>
          <p className="text-[12px] font-semibold text-muted-foreground">
            미리보기
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* 이름 */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="cat-name"
              className="text-[13px] font-bold text-gray-700"
            >
              이름
            </label>
            <input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="식비"
              maxLength={20}
              className={FIELD}
            />
          </div>

          {/* 아이콘 */}
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-gray-700">아이콘</p>
            <div className="grid grid-cols-8 gap-2">
              {CATEGORY_ICONS.map((name) => (
                <button
                  key={name}
                  type="button"
                  aria-label={name}
                  aria-pressed={icon === name}
                  onClick={() => setIcon(name)}
                  className={`flex aspect-square cursor-pointer items-center justify-center rounded-md transition ${
                    icon === name
                      ? "bg-brand-light"
                      : "bg-background hover:bg-secondary"
                  }`}
                >
                  <Icon
                    name={name}
                    size={20}
                    color={icon === name ? color : "var(--gray-500)"}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 색상 */}
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-gray-700">색상</p>
            <div className="flex gap-3">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`색상 ${c}`}
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
                  className="size-7.5 cursor-pointer rounded-full transition"
                  style={{
                    backgroundColor: c,
                    boxShadow:
                      color === c
                        ? `0 0 0 2px white, 0 0 0 4px ${c}`
                        : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          {/* 월 예산 */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="cat-budget"
              className="text-[13px] font-bold text-gray-700"
            >
              월 예산 (선택)
            </label>
            <input
              id="cat-budget"
              inputMode="numeric"
              value={budget ? formatAmount(Number(budget)) : ""}
              onChange={(e) =>
                setBudget(
                  e.target.value
                    .replace(/[^\d]/g, "")
                    .slice(0, String(MAX_TRANSACTION_AMOUNT).length),
                )
              }
              placeholder="600,000원"
              className={`${FIELD} tabular-nums`}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending}
          className="w-full cursor-pointer rounded-lg bg-primary pt-4.25 pb-3.75 text-[15px] font-bold text-primary-foreground disabled:opacity-60"
        >
          {pending ? "저장 중..." : isEdit ? "저장하기" : "추가하기"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
