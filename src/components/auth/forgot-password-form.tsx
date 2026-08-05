"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { IconInput } from "@/components/auth/icon-input";
import { Icon } from "@/components/common/icon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/actions/auth";
import { emailSchema } from "@/lib/schemas";

export default function ForgotPasswordForm({ expired }: { expired: boolean }) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setPending(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
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
        {sent ? (
          <div className="flex flex-col items-center text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-light">
              <Icon name="mark_email_read" size={28} color="var(--brand)" />
            </span>
            <h2 className="mt-5 text-2xl font-bold text-foreground">
              메일을 보냈어요
            </h2>
            <p className="mt-2 text-muted-foreground">
              {email}로 재설정 링크를 보냈어요.
              <br />
              메일이 보이지 않으면 스팸함도 확인해 주세요.
            </p>
            <Link
              href="/login"
              className="mt-8 text-sm font-semibold text-primary"
            >
              로그인으로 돌아가기
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-foreground">
              비밀번호 찾기
            </h2>
            <p className="mt-1 text-muted-foreground">
              가입한 이메일로 재설정 링크를 보내드릴게요
            </p>

            {expired && (
              <p className="mt-6 rounded-lg bg-expense-bg px-3.5 py-3 text-sm font-semibold text-expense">
                링크가 만료되었어요. 다시 요청해 주세요.
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">이메일</Label>
                <IconInput
                  id="email"
                  type="email"
                  icon="mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={pending}
                className="mt-2 h-12 w-full cursor-pointer rounded-lg text-[15px] font-bold"
              >
                {pending ? "전송 중..." : "재설정 링크 받기"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link href="/login" className="font-semibold text-primary">
                로그인으로 돌아가기
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
