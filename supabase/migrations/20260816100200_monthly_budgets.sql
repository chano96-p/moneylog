-- 월 총예산 — 카테고리별 budgets와 별개의 전체 한도.
-- budgets.category_id를 nullable로 되돌려 총예산 행을 섞으면
-- 20260731005242가 고친 unique 무력화 문제가 재발하므로 테이블을 분리한다.

create table monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null,
  amount bigint not null check (amount >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, month)
);

alter table monthly_budgets enable row level security;

create policy "본인 총예산만" on monthly_budgets
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
