"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CategoryFormModal } from "@/components/categories/category-form-modal";
import { Icon } from "@/components/common/icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteCategory } from "@/lib/actions/categories";
import type { Category } from "@/lib/types";

export function CategoryMenu({
  category,
  month,
  budget,
  transactionCount,
}: {
  category: Category;
  month: string;
  budget: number | null;
  transactionCount: number;
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    try {
      await deleteCategory(category.id);
      toast.success("카테고리를 삭제했어요.");
      setConfirming(false);
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`${category.name} 메뉴`}
            className="flex cursor-pointer items-center justify-center px-1.5 py-1 text-gray-300 hover:text-gray-500"
          >
            <Icon name="more_horiz" size={20} color="currentColor" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-32 rounded-lg p-1.5">
          <DropdownMenuItem
            onSelect={() => setEditing(true)}
            className="cursor-pointer rounded-[10px] px-2.5 py-2 text-[13px]"
          >
            <Icon name="edit" size={16} color="var(--gray-500)" />
            수정
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setConfirming(true)}
            className="cursor-pointer rounded-[10px] px-2.5 py-2 text-[13px] text-expense focus:text-expense"
          >
            <Icon name="delete" size={16} color="currentColor" />
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CategoryFormModal
        key={editing ? category.id : "closed"}
        open={editing}
        onOpenChange={setEditing}
        type={category.type}
        month={month}
        category={category}
        currentBudget={budget}
      />

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent className="rounded-3xl border-0 p-7">
          <AlertDialogTitle className="text-[19px] font-extrabold text-foreground">
            '{category.name}' 카테고리를 삭제할까요?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[14px] text-muted-foreground">
            {transactionCount > 0
              ? `이 카테고리를 사용한 거래 ${transactionCount}건이 '미분류'로 바뀌어요. 거래 기록 자체는 삭제되지 않고, 설정한 예산은 함께 삭제돼요.`
              : "설정한 예산도 함께 삭제돼요."}
          </AlertDialogDescription>
          <AlertDialogFooter className="mt-2 gap-2">
            <AlertDialogCancel className="flex-1 cursor-pointer rounded-[13px] border-0 bg-secondary py-3.25 text-[14px] font-bold text-gray-700">
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={pending}
              className="flex-1 cursor-pointer rounded-[13px] bg-expense py-3.25 text-[14px] font-bold text-white"
            >
              {pending ? "삭제 중..." : "삭제하기"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
