import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ResetForm from "@/components/auth/reset-form";

export default async function ResetPasswordPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("pw-recovery")) redirect("/forgot-password");

  return <ResetForm />;
}
