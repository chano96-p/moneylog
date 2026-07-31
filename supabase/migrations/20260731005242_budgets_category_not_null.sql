-- budgets.category_id를 NOT NULL로.
-- nullable이면 Postgres가 NULL 행끼리는 유일성 비교를 하지 않아
-- unique (user_id, category_id, month) 제약이 무력화되고,
-- upsert의 onConflict가 매번 새 행을 만든다.
-- 우리는 항상 카테고리별 예산만 사용하므로 NULL을 허용할 이유가 없음.

delete from budgets where category_id is null;

alter table budgets alter column category_id set not null;
