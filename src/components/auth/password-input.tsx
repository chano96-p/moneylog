"use client";

import { type ComponentProps, useState } from "react";
import { Icon } from "@/components/common/icon";
import { IconInput } from "./icon-input";

type PasswordInputProps = Omit<
  ComponentProps<typeof IconInput>,
  "icon" | "type" | "trailing"
>;

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <IconInput
      icon="lock"
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
          className="flex size-8 items-center justify-center cursor-pointer rounded-lg text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon name={visible ? "visibility" : "visibility_off"} size={20} />
        </button>
      }
      {...props}
    />
  );
}
