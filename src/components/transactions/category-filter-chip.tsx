"use client";

import { Icon } from "@/components/common/icon";
import { useSearchParamUpdater } from "@/hooks/use-search-param-updater";
import type { Category } from "@/lib/types";

export function CategoryFilterChip({ category }: { category: Category }) {
  const setParam = useSearchParamUpdater();

  return (
    <button
      type="button"
      onClick={() => setParam("category", null)}
      aria-label={`${category.name} 필터 해제`}
      className="flex h-8.5 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[13px] font-bold transition hover:opacity-80"
      style={{
        backgroundColor: `color-mix(in srgb, ${category.color} 12%, transparent)`,
        color: category.color,
      }}
    >
      <Icon name={category.icon} size={15} color="currentColor" />
      {category.name}
      <Icon name="close" size={15} color="currentColor" />
    </button>
  );
}
