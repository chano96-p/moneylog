"use server";

import { redirect } from "next/navigation";
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
