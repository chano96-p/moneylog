"use client";

import { Icon } from "@/components/common/icon";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Category } from "@/lib/types";

type CategoryPickerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function CategoryPickerModal({
  open,
  onOpenChange,
  categories,
  selectedId,
  onSelect,
}: CategoryPickerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-120 max-w-[calc(100%-2rem)] gap-5.5 rounded-3xl border-0 p-7 shadow-modal"
      >
        <div className="flex items-center justify-between">
          <DialogTitle className="text-[19px] font-extrabold text-foreground">
            카테고리 선택
          </DialogTitle>
          <button
            type="button"
            aria-label="닫기"
            onClick={() => onOpenChange(false)}
            className="flex size-8.5 cursor-pointer items-center justify-center rounded-[10px] bg-secondary"
          >
            <Icon name="close" size={20} color="var(--gray-500)" />
          </button>
        </div>

        <div className="grid max-h-95 grid-cols-4 gap-2.5 overflow-y-auto">
          {categories.map((c) => {
            const selected = selectedId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  onSelect(c.id);
                  onOpenChange(false);
                }}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-lg p-3 transition"
                style={{
                  backgroundColor: selected
                    ? `color-mix(in srgb, ${c.color} 12%, transparent)`
                    : "var(--gray-50)",
                }}
              >
                <Icon
                  name={c.icon}
                  size={22}
                  color={selected ? c.color : "var(--gray-500)"}
                />
                <span
                  className={`w-full truncate text-center text-[12px] ${
                    selected
                      ? "font-bold"
                      : "font-semibold text-muted-foreground"
                  }`}
                  style={selected ? { color: c.color } : undefined}
                >
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
