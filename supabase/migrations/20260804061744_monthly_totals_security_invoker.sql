-- security invoker 명시 복원 (기본값이지만 의도를 코드에 남김)
-- + txn_type 화이트리스트 검증 추가 (리뷰 6번)
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
  where txn_type in ('income', 'expense')
    and type = txn_type
    and date >= to_date(start_month, 'YYYY-MM')
    and date < (to_date(end_month, 'YYYY-MM') + interval '1 month')
  group by 1 order by 1;
$$;
