"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useCallback } from "react";

/**
 * searchParams의 키 하나를 갱신(null이면 제거) — 필터 상태 공용.
 * startTransition: 쿼리 변경은 같은 화면의 갱신이므로, 새 데이터가
 * 준비될 때까지 기존 화면을 유지한다 (loading.tsx 스켈레톤 깜빡임 방지).
 */
export function useSearchParamUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams);
      if (value === null) params.delete(key);
      else params.set(key, value);

      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );
}
