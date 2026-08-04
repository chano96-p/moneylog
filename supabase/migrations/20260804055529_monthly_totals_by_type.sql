-- 기존 함수 제거 (시그니처가 바뀌면 create or replace는 오버로드를 추가함)
drop function if exists public.monthly_expense_totals(text, text);

-- 월별 합계 (RPC). month는 'YYYY-MM' 텍스트 — 앱 Map 키와 형식 계약
-- SECURITY INVOKER(기본값, 생략됨): RLS 적용. definer 변경 금지
-- 거래가 없는 달은 반환 안 됨(희소) — 0 채움은 앱이 담당
create or replace function monthly_totals(
  start_month text,
  end_month text,
  txn_type text
)
returns table (month text, total bigint)
language sql stable set search_path = public
as $$
  select to_char(date, 'YYYY-MM') as month, sum(amount)::bigint as total
  from transactions
  where type = txn_type
    and date >= to_date(start_month, 'YYYY-MM')
    and date < (to_date(end_month, 'YYYY-MM') + interval '1 month')
  group by 1 order by 1;
$$;
