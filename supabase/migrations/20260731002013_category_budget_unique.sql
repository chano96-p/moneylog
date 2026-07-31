-- 같은 유저 안에서 (이름, 타입) 중복 방지
-- 지출 '식비'와 수입 '식비'는 별개이므로 type 포함
alter table categories
  add constraint categories_user_name_type_unique unique (user_id, name, type);

-- 예산 upsert(onConflict)를 위한 유일 키
alter table budgets
  add constraint budgets_user_category_month_unique unique (user_id, category_id, month);
