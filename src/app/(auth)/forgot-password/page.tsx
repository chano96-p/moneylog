import ForgotPasswordForm from "@/components/auth/forgot-password-form";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return <ForgotPasswordForm expired={params.error === "expired"} />;
}
