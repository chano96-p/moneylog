"use server";

import { redirect } from "next/navigation";
import { passwordChangeSchema } from "../schemas";
import { createClient } from "../supabase/server";

type LoginInput = {
  email: string;
  password: string;
};

type SignupInput = {
  email: string;
  password: string;
  name: string;
};

export async function login({ email, password }: LoginInput) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error("이메일 또는 비밀번호가 올바르지 않아요.", {
      cause: error,
    });
  }
}

export async function signup({ name, email, password }: SignupInput) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw new Error(error.message);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}) {
  const parsed = passwordChangeSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("로그인이 필요해요.");

  // 현재 비밀번호 재확인
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });
  if (reauthError) throw new Error("현재 비밀번호가 올바르지 않아요.");

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });

  if (error) {
    // 실행 가능한 사유는 전달
    if (error.message.includes("should be different")) {
      throw new Error("기존과 다른 비밀번호를 입력해 주세요.");
    }
    throw new Error("비밀번호를 변경하지 못했어요.", { cause: error });
  }
}
