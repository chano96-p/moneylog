"use client";

import { useEffect } from "react";
import { Icon } from "@/components/common/icon";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-card py-24 shadow-card">
      <Icon name="error" size={40} color="var(--gray-300)" />
      <p className="text-[15px] font-bold text-foreground">
        화면을 불러오지 못했어요
      </p>
      <p className="text-[13px] text-muted-foreground">
        잠시 후 다시 시도해 주세요.
      </p>
      {error.digest && (
        <p className="text-[11px] text-gray-300 tabular-nums">
          오류 코드: {error.digest}
        </p>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-2 cursor-pointer rounded-[12px] bg-primary px-5 py-2.5 text-[14px] font-bold text-primary-foreground"
      >
        다시 시도
      </button>
    </div>
  );
}
