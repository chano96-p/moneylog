-- 리뷰 반영 2건.
-- 1) month 형식 CHECK — 'YYYY-MM' 외 값('2026-13' 등) 차단. 신규 테이블에만 적용
-- 2) materialize_recurring 경쟁 판정을 FOUND 대신 returning 값으로 명시화.
--    기존 if not found도 동작하지만(0행 insert → found=false),
--    판정 대상 문장이 변수에 묶여 있어야 향후 코드 삽입에도 안전

alter table recurring_occurrences add constraint recurring_occurrences_month_check
  check (month ~ '^\d{4}-(0[1-9]|1[0-2])$');

alter table monthly_budgets add constraint monthly_budgets_month_check
  check (month ~ '^\d{4}-(0[1-9]|1[0-2])$');

create or replace function materialize_recurring(target_month text)
returns void
language plpgsql security invoker set search_path = public
as $$
declare
  r record;
  month_start date := to_date(target_month, 'YYYY-MM');
  last_day int := extract(day from (month_start + interval '1 month - 1 day'))::int;
  new_txn uuid;
  new_occ uuid;
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

    -- 동시 요청 경쟁: unique(rule_id, month)가 심판.
    -- 충돌로 스킵되면 new_occ가 null → 내가 만든 거래를 되돌림
    insert into recurring_occurrences (user_id, rule_id, month, transaction_id)
    values (r.user_id, r.id, target_month, new_txn)
    on conflict (rule_id, month) do nothing
    returning id into new_occ;

    if new_occ is null then
      delete from transactions where id = new_txn;
    end if;
  end loop;
end;
$$;
