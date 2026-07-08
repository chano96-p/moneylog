"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Icon } from "@/components/icon";
import { IconInput } from "@/components/icon-input";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { signup } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: "bolt",
    title: "빠른 입력",
    desc: "몇 번의 터치로 간편하게 기록",
    color: "text-warning",
  },
  {
    icon: "category",
    title: "카테고리 관리",
    desc: "나만의 카테고리로 지출 정리",
    color: "text-primary",
  },
  {
    icon: "insights",
    title: "월간 리포트",
    desc: "소비 습관을 한눈에 분석",
    color: "text-income",
  },
];

const STRENGTH = [
  { label: "너무 짧아요", color: "bg-expense", text: "text-expense" },
  { label: "약함", color: "bg-expense", text: "text-expense" },
  { label: "보통", color: "bg-warning", text: "text-warning" },
  { label: "양호", color: "bg-primary", text: "text-primary" },
  { label: "안전", color: "bg-income", text: "text-income" },
];

function strengthOf(pw: string) {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0~4
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const score = strengthOf(password);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signup({ name, email, password });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했어요.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* 좌측 다크 패널 */}
      <div className="hidden w-1/2 flex-col justify-between bg-foreground p-16 text-white lg:flex">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/15">
              <Icon name="savings" filled size={22} />
            </div>
            <span className="text-xl font-bold">머니로그</span>
          </div>
          <h1 className="mt-12 text-4xl font-extrabold leading-snug">
            3분이면 충분해요
            <br />
            지금 시작해 보세요
          </h1>
          <p className="mt-5 text-lg text-white/70">
            복잡한 설정 없이 바로 쓸 수 있어요.
            <br />
            가입 즉시 모든 기능을 써볼 수 있어요.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-center gap-3.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/10">
                <Icon name={f.icon} filled size={20} className={f.color} />
              </div>
              <div>
                <p className="font-bold">{f.title}</p>
                <p className="text-sm text-white/60">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 우측 폼 */}
      <div className="flex flex-1 items-center justify-center bg-card px-6">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-foreground">회원가입</h2>
          <p className="mt-1 text-muted-foreground">
            무료로 가계부를 시작해 보세요
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">이름</Label>
              <IconInput
                id="name"
                icon="person"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                required
              />
            </div>
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
                placeholder="6자 이상"
                required
                minLength={6}
              />

              {/* 강도 게이지 */}
              {password && (
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex flex-1 gap-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1.25 flex-1 rounded-[3px] transition-colors",
                          i < score ? STRENGTH[score].color : "bg-muted",
                        )}
                      />
                    ))}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      STRENGTH[score].text,
                    )}
                  >
                    {STRENGTH[score].label}
                  </span>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-expense">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 cursor-pointer h-12 w-full rounded-lg text-[15px] font-bold"
            >
              {loading ? "가입 중..." : "가입하고 시작하기"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="font-semibold text-primary">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
