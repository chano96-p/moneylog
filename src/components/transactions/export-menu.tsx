"use client";

import { format, parse } from "date-fns";
import { Icon } from "@/components/common/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ExportMenu({ month }: { month: string }) {
  const monthLabel = format(parse(month, "yyyy-MM", new Date()), "yyyy년 M월");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="내보내기"
          className="flex h-9 cursor-pointer items-center gap-1.5 rounded-[12px] bg-white px-3.5 text-[13px] font-semibold text-gray-700 shadow-control"
        >
          <Icon name="download" size={18} color="currentColor" />
          내보내기
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-40 rounded-lg p-1.5">
        <DropdownMenuItem
          onSelect={() => window.location.assign(`/api/export?month=${month}`)}
          className="cursor-pointer rounded-[10px] px-2.5 py-2 text-[13px]"
        >
          <Icon name="calendar_month" size={16} color="var(--gray-500)" />
          {monthLabel} CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => window.location.assign("/api/export")}
          className="cursor-pointer rounded-[10px] px-2.5 py-2 text-[13px]"
        >
          <Icon name="all_inclusive" size={16} color="var(--gray-500)" />
          전체 기간 CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
