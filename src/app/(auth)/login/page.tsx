"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { IconInput } from "@/components/auth/icon-input";
import { PasswordInput } from "@/components/auth/password-input";
import { Icon } from "@/components/common/icon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했어요.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* 좌측 브랜드 패널 */}
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-16 text-primary-foreground lg:flex">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/20">
              <Icon name="savings" filled size={22} />
            </div>
            <span className="text-xl font-bold">머니로그</span>
          </div>
          <h1 className="mt-12 text-4xl font-extrabold leading-snug">
            돈의 흐름이
            <br />
            한눈에 보이는
            <br />
            가장 쉬운 가계부
          </h1>
          <p className="mt-5 text-lg text-white/80">
            지출을 기록하면 카테고리별로 정리돼요.
            <br />
            이번 달 예산도 똑똑하게 관리하세요.
          </p>
        </div>

        {/* 미니 카드 */}
        <div className="rounded-xl bg-white/[0.14] p-5.5 backdrop-blur-sm">
          <p className="text-sm text-white/70">이번 달 총 지출</p>
          <p className="mt-1 text-3xl font-extrabold">
            1,472,000<span className="ml-1 text-lg font-bold">원</span>
          </p>
          <div className="mt-3.5 h-2 overflow-hidden rounded-[5px] bg-white/[0.28]">
            <div className="h-full w-[74%] rounded-[5px] bg-white" />
          </div>
          <p className="mt-2.5 text-xs text-white/70">
            예산의 74% 사용 · 528,000원 남음
          </p>
        </div>
      </div>

      {/* 우측 폼 */}
      <div className="flex flex-1 items-center justify-center bg-card px-6">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-foreground">로그인</h2>
          <p className="mt-1 text-muted-foreground">
            머니로그에 오신 걸 환영해요
          </p>

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
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">비밀번호</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex justify-end">
              <Link href="#" className="text-sm font-semibold text-primary">
                비밀번호 찾기
              </Link>
            </div>

            {error && <p className="text-sm text-expense">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 cursor-pointer h-12 w-full rounded-lg text-[15px] font-bold"
            >
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            아직 계정이 없으신가요?{" "}
            <Link href="/signup" className="font-semibold text-primary">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
