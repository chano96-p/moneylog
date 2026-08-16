-- 반복 거래(고정지출) 규칙.
-- 규칙 자체는 거래가 아니고, 매달 방문 시 materialize_recurring이
-- 실제 transactions 행으로 구체화한다.

create table recurring_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  type text not null
    check (type = any (array['income'::text, 'expense'::text, 'saving'::text])),
  amount bigint not null check (amount >= 0),
  day_of_month int not null check (day_of_month between 1 and 31),
  memo text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 월별 생성 원장 — "이 규칙은 이 달에 이미 처리됨"의 유일한 진실.
-- 생성된 거래를 사용자가 삭제해도(= 그 달 건너뛰기) 이 행은 남으므로
-- 재방문 시 거래가 부활하지 않는다. transaction_id는 거래 삭제 시 null.
create table recurring_occurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rule_id uuid not null references recurring_rules(id) on delete cascade,
  month text not null,
  transaction_id uuid references transactions(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (rule_id, month)
);

-- 거래의 출처 규칙 — 목록의 "고정" 배지, 고정비/변동비 구분용
alter table transactions add column recurring_rule_id uuid
  references recurring_rules(id) on delete set null;

alter table recurring_rules enable row level security;
alter table recurring_occurrences enable row level security;

create policy "본인 반복 규칙만" on recurring_rules
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "본인 반복 원장만" on recurring_occurrences
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 해당 월에 아직 처리 안 된 활성 규칙을 거래로 구체화.
-- SECURITY INVOKER: RLS가 본인 규칙만 보여주므로 user_id 필터 불필요.
-- 29~31일 규칙은 짧은 달의 말일로 클램프.
-- 동시 요청 경쟁: 원장 unique(rule_id, month)가 최종 심판 —
-- on conflict로 진 쪽(found = false)은 자기가 만든 거래를 되돌린다.
create or replace function materialize_recurring(target_month text)
returns void
language plpgsql security invoker set search_path = public
as $$
declare
  r record;
  month_start date := to_date(target_month, 'YYYY-MM');
  last_day int := extract(day from (month_start + interval '1 month - 1 day'))::int;
  new_txn uuid;
begin
  for r in
    select * from recurring_rules rr
    where rr.is_active
      and not exists (
        select 1 from recurring_occurrences o
        where o.rule_id = rr.id and o.month = target_month
      )
  loop
    insert into transactions (user_id, category_id, type, amount, date, memo, recurring_rule_id)
    values (r.user_id, r.category_id, r.type, r.amount,
            month_start + (least(r.day_of_month, last_day) - 1), r.memo, r.id)
    returning id into new_txn;

    insert into recurring_occurrences (user_id, rule_id, month, transaction_id)
    values (r.user_id, r.id, target_month, new_txn)
    on conflict (rule_id, month) do nothing;

    if not found then
      delete from transactions where id = new_txn;
    end if;
  end loop;
end;
$$;
