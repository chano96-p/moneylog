-- 저축(saving) 제3 거래 타입 추가.
-- CHECK 제약은 조건 변경이 불가 → drop 후 같은 이름으로 재생성.
-- 기존 행은 전부 income/expense라 재검증에 걸릴 데이터 없음.

alter table transactions drop constraint transactions_type_check;
alter table transactions add constraint transactions_type_check
  check (type = any (array['income'::text, 'expense'::text, 'saving'::text]));

alter table categories drop constraint categories_type_check;
alter table categories add constraint categories_type_check
  check (type = any (array['income'::text, 'expense'::text, 'saving'::text]));

-- monthly_totals 화이트리스트에 saving 추가.
-- 시그니처가 동일하므로 create or replace가 오버로드를 만들지 않음.
create or replace function monthly_totals(
  start_month text,
  end_month text,
  txn_type text
)
returns table (month text, total bigint)
language sql stable security invoker set search_path = public
as $$
  select to_char(date, 'YYYY-MM') as month, sum(amount)::bigint as total
  from transactions
  where txn_type in ('income', 'expense', 'saving')
    and type = txn_type
    and date >= to_date(start_month, 'YYYY-MM')
    and date < (to_date(end_month, 'YYYY-MM') + interval '1 month')
  group by 1 order by 1;
$$;
