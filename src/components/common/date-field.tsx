"use client";

import { ko } from "date-fns/locale";
import { useState } from "react";
import { Icon } from "@/components/common/icon";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatDate, parseDate, toDateString } from "@/lib/format";

export function DateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (date: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [temp, setTemp] = useState(() => parseDate(value));

  function handleOpenChange(next: boolean) {
    if (next) setTemp(parseDate(value));
    setOpen(next);
  }

  function confirm() {
    onChange(toDateString(temp));
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className="flex w-full items-center justify-between rounded-[12px] bg-background px-3.5 py-3.25"
      >
        <span className="text-[14px] font-semibold text-foreground">
          {formatDate(value)}
        </span>
        <Icon name="calendar_today" size={18} color="var(--gray-500)" />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="w-95 max-w-none gap-5.5 rounded-3xl border-0 p-7 shadow-modal"
        >
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[19px] font-extrabold text-foreground">
              날짜 선택
            </DialogTitle>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex cursor-pointer size-8.5 items-center justify-center rounded-[10px] bg-secondary"
            >
              <Icon name="close" size={20} color="var(--gray-500)" />
            </button>
          </div>

          <Calendar
            mode="single"
            required
            locale={ko}
            selected={temp}
            month={temp}
            onMonthChange={setTemp}
            onSelect={setTemp}
            showOutsideDays={false}
            className="w-full bg-transparent p-0"
            classNames={{
              root: "w-full",
              months: "relative flex flex-col",
              month: "flex w-full flex-col gap-3",
              nav: "absolute inset-x-0 top-0 flex h-8 items-center justify-between",
              button_previous:
                "flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary",
              button_next:
                "flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary",
              month_caption: "flex h-8 w-full items-center justify-center",
              caption_label:
                "select-none text-[15px] font-bold text-foreground",
              weekdays:
                "grid grid-cols-7 gap-0.5 [&>*:first-child]:text-expense [&>*:last-child]:text-primary",
              weekday: "py-1.5 text-[12px] font-bold text-muted-foreground",

              week: "grid grid-cols-7 gap-0.5",
              day: "aspect-square p-0",
              day_button:
                "size-full cursor-pointer rounded-full text-[13px] font-semibold text-foreground transition hover:bg-secondary data-[selected-single=true]:bg-primary data-[selected-single=true]:font-extrabold data-[selected-single=true]:text-primary-foreground data-[selected-single=true]:hover:bg-primary",

              today: "",
              disabled: "opacity-40",
              hidden: "invisible",
            }}
            modifiers={{
              sunday: { dayOfWeek: [0] },
              saturday: { dayOfWeek: [6] },
            }}
            modifiersClassNames={{
              sunday:
                "[&>button:not([data-selected-single=true])]:!text-expense",
              saturday:
                "[&>button:not([data-selected-single=true])]:!text-primary",
            }}
          />

          {/* 하단: 오늘(1) : 선택(2) */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTemp(new Date())}
              className="cursor-pointer rounded-[13px] bg-[#f2f4f6] py-3.25 text-[14px] font-bold text-[#4e5968]"
            >
              오늘
            </button>
            <button
              type="button"
              onClick={confirm}
              className="col-span-2 cursor-pointer rounded-[13px] bg-[#3182f6] py-3.25 text-[14px] font-bold text-white"
            >
              {formatDate(toDateString(temp))} 선택
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
