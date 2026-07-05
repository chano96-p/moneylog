import type { ReactNode } from "react";
import { Icon } from "@/components/icon";

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen">
      {/* 좌측 브랜드 패널 */}
      <div className="hidden w-1/2 flex-col justify-center bg-primary px-16 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-white/20">
            <Icon name="savings" filled size={22} />
          </div>
          <span className="text-xl font-bold">머니로그</span>
        </div>
        <h1 className="mt-10 text-4xl font-extrabold leading-snug">
          돈의 흐름이
          <br />
          한눈에 보이는
          <br />
          가장 쉬운 가계부
        </h1>
        <p className="mt-4 text-lg text-white/80">
          지출을 기록하면 카테고리별로 정리돼요.
          <br />
          이번 달 예산도 똑똑하게 관리하세요.
        </p>
      </div>

      {/* 우측 폼 영역 */}
      <div className="flex flex-1 items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
