-- 조회 창에 상한 추가: 과거 월 조회 시 이후 데이터가 섞이지 않도록
create or replace function monthly_expense_totals(start_month text, end_month text)
returns table (month text, total bigint)
language sql stable security invoker set search_path = public
as $$
  select to_char(date, 'YYYY-MM') as month, sum(amount)::bigint as total
  from transactions
  where type = 'expense'
    and date >= to_date(start_month, 'YYYY-MM')
    and date < (to_date(end_month, 'YYYY-MM') + interval '1 month')
  group by 1 order by 1;
$$;
