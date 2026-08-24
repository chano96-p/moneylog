-- 기간 카테고리별 합계 (RPC). 연간 리포트용.
-- 1년치 거래를 앱으로 가져와 집계하면 PostgREST max-rows(1000)에서
-- 조용히 잘리므로(내보내기에서 확인된 제약) SQL에서 집계한다.
-- SECURITY INVOKER: transactions RLS 적용. definer 변경 금지.
-- category_id가 null인 행 = 미분류 거래 합계.
create or replace function category_totals(
  start_month text,
  end_month text,
  txn_type text
)
returns table (category_id uuid, total bigint)
language sql stable security invoker set search_path = public
as $$
  select category_id, sum(amount)::bigint as total
  from transactions
  where txn_type in ('income', 'expense', 'saving')
    and type = txn_type
    and date >= to_date(start_month, 'YYYY-MM')
    and date < (to_date(end_month, 'YYYY-MM') + interval '1 month')
  group by 1 order by 2 desc;
$$;
