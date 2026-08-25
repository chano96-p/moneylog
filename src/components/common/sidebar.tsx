"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { signOut } from "@/lib/actions/auth";
import { BrandMark } from "./brand-mark";
import { Icon } from "./icon";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: "home" },
  { href: "/transactions", label: "거래 내역", icon: "receipt_long" },
  { href: "/recurring", label: "반복 거래", icon: "event_repeat" },
  { href: "/reports", label: "리포트", icon: "monitoring" },
  { href: "/categories", label: "카테고리", icon: "category" },
  { href: "/budgets", label: "예산", icon: "savings" },
  { href: "/settings", label: "설정", icon: "settings" },
];

/** useSearchParams는 Suspense 경계가 필요 → 훅 호출부만 분리 */
function MonthAwareNavLinks() {
  // 보고 있던 월을 페이지 이동 후에도 유지 (month는 URL이 진실의 원천)
  return <NavLinks month={useSearchParams().get("month")} />;
}

function NavLinks({ month }: { month: string | null }) {
  const pathname = usePathname();

  return (
    <>
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={
              month
                ? `${item.href}?month=${encodeURIComponent(month)}`
                : item.href
            }
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors ${
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-sidebar-foreground"
            }`}
          >
            <Icon name={item.icon} filled={active} size={22} />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-col border-r border-sidebar-border bg-sidebar">
      {/* 로고 — 쿼리 없는 홈으로: 보던 월이 초기화되는 리셋 동선 */}
      <Link href="/" className="flex items-center gap-2 px-5 py-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BrandMark size={16} />
        </div>
        <span className="text-lg font-bold text-sidebar-foreground">
          머니로그
        </span>
      </Link>

      {/* 네비게이션 — 프리렌더 fallback은 쿼리 없는 동일 링크 */}
      <nav className="flex flex-col gap-1 px-3">
        <Suspense fallback={<NavLinks month={null} />}>
          <MonthAwareNavLinks />
        </Suspense>
      </nav>

      <form action={signOut} className="mt-auto p-3">
        <button
          type="submit"
          className="flex cursor-pointer w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-sidebar-foreground"
        >
          <Icon name="logout" size={22} />
          로그아웃
        </button>
      </form>
    </aside>
  );
}
