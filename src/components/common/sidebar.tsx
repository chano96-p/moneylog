"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-col border-r border-sidebar-border bg-sidebar">
      {/* 로고 */}
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Icon name="savings" filled size={20} />
        </div>
        <span className="text-lg font-bold text-sidebar-foreground">
          머니로그
        </span>
      </div>

      {/* 네비게이션 */}
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
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
