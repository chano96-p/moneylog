"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/actions/auth";

export default function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("비밀번호가 일치하지 않아요.");
      return;
    }
    setPending(true);
    try {
      await resetPassword(password);
      toast.success("비밀번호를 변경했어요.");
      router.replace("/");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-card px-6">
      <div className="w-full max-w-sm">
        <h2 className="text-2xl font-bold text-foreground">새 비밀번호 설정</h2>
        <p className="mt-1 text-muted-foreground">
          새로 사용할 비밀번호를 입력해 주세요
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">새 비밀번호</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm">새 비밀번호 확인</Label>
            <PasswordInput
              id="confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="mt-2 h-12 w-full cursor-pointer rounded-lg text-[15px] font-bold"
          >
            {pending ? "변경 중..." : "변경하기"}
          </Button>
        </form>
      </div>
    </div>
  );
}
