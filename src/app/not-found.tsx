import Link from "next/link";
import { Icon } from "@/components/common/icon";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <Icon name="search_off" size={44} color="var(--gray-300)" />
      <p className="text-[17px] font-bold text-foreground">
        페이지를 찾을 수 없어요
      </p>
      <Link
        href="/"
        className="mt-2 rounded-[12px] bg-primary px-5 py-2.5 text-[14px] font-bold text-primary-foreground"
      >
        홈으로
      </Link>
    </div>
  );
}
