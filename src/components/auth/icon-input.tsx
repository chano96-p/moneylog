import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "../common/icon";

type IconInputProps = ComponentProps<"input"> & {
  icon: string; // 좌측 Material Symbol 이름
  trailing?: React.ReactNode; // 우측 슬롯 (예: 눈 토글)
};

export function IconInput({
  icon,
  trailing,
  className,
  ...props
}: IconInputProps) {
  return (
    <div
      className={cn(
        "flex h-12 items-center gap-2.5 rounded-[13px] bg-background px-4",
        "border-[1.5px] border-transparent transition-colors",
        "focus-within:border-primary focus-within:bg-card",
      )}
    >
      <Icon name={icon} size={20} className="shrink-0 text-muted-foreground" />
      <input
        className={cn(
          "w-full bg-transparent text-[15px] text-foreground outline-none",
          "placeholder:text-muted-foreground",
          className,
        )}
        {...props}
      />
      {trailing}
    </div>
  );
}
