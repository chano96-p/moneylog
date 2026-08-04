"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/common/icon";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { changePassword } from "@/lib/actions/auth";

const FIELD =
  "w-full rounded-[12px] bg-background px-3.5 py-3.25 text-[14px] font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-ring/50";

export function PasswordChangeModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit() {
    if (password !== confirm) {
      toast.error("비밀번호가 일치하지 않아요.");
      return;
    }

    setPending(true);
    try {
      await changePassword({ currentPassword, newPassword: password });
      toast.success("비밀번호를 변경했어요.");
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
        className="w-100 max-w-[calc(100%-2rem)] gap-5.5 rounded-3xl border-0 p-7 shadow-modal"
      >
        <div className="flex items-center justify-between">
          <DialogTitle className="text-[19px] font-extrabold text-foreground">
            비밀번호 변경
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

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="current-password"
              className="text-[13px] font-bold text-gray-700"
            >
              현재 비밀번호
            </label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={FIELD}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="new-password"
              className="text-[13px] font-bold text-gray-700"
            >
              새 비밀번호
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상"
              className={FIELD}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="confirm-password"
              className="text-[13px] font-bold text-gray-700"
            >
              새 비밀번호 확인
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={FIELD}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending}
          className="w-full cursor-pointer rounded-lg bg-primary pt-4.25 pb-3.75 text-[15px] font-bold text-primary-foreground disabled:opacity-60"
        >
          {pending ? "변경 중..." : "변경하기"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
