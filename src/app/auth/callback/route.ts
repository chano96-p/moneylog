import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_NEXT = ["/reset-password"] as const;

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const requested = searchParams.get("next");
  const next = ALLOWED_NEXT.find((path) => path === requested) ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      if (next === "/reset-password") {
        response.cookies.set("pw-recovery", "1", {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 10, // 10분
          path: "/",
        });
      }
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/forgot-password?error=expired`);
}
