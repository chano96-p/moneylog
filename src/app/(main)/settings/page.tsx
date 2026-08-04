import { SettingsActions } from "@/components/settings/settings-actions";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name = (user?.user_metadata.name as string | undefined) ?? "회원";
  const email = user?.email ?? "";

  return (
    <div className="space-y-5">
      <h1 className="text-[22px] font-extrabold text-foreground">설정</h1>

      {/* 프로필 */}
      <section className="flex items-center gap-4 rounded-2xl bg-card p-6 shadow-card">
        <span className="flex size-13 shrink-0 items-center justify-center rounded-full bg-brand-light text-[18px] font-bold text-primary">
          {name.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[17px] font-bold text-foreground">
            {name}
          </p>
          <p className="truncate text-[14px] text-muted-foreground">{email}</p>
        </div>
      </section>

      <SettingsActions />
    </div>
  );
}
