"use client";

import { useState } from "react";
import { Icon } from "@/components/common/icon";
import { PasswordChangeModal } from "@/components/settings/password-change-modal";
import { signOut } from "@/lib/actions/auth";

export function SettingsActions() {
  const [passwordOpen, setPasswordOpen] = useState(false);

  return (
    <>
      <section className="rounded-2xl bg-card p-6 shadow-card">
        <h2 className="text-[16px] font-bold text-foreground">계정</h2>
        <ul className="mt-2">
          <li>
            <button
              type="button"
              onClick={() => setPasswordOpen(true)}
              className="flex w-full cursor-pointer items-center justify-between border-b border-gray-100 py-4 text-left"
            >
              <span className="text-[14px] font-semibold text-gray-700">
                비밀번호 변경
              </span>
              <Icon name="chevron_right" size={18} color="var(--gray-400)" />
            </button>
          </li>
          <li>
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center justify-between py-4 text-left"
              >
                <span className="text-[14px] font-semibold text-expense">
                  로그아웃
                </span>
                <Icon name="logout" size={18} color="var(--expense)" />
              </button>
            </form>
          </li>
        </ul>
      </section>

      <PasswordChangeModal
        key={passwordOpen ? "open" : "closed"}
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
      />
    </>
  );
}
