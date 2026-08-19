import z from "zod";
import { EmptyState } from "@/components/common/empty-state";
import { RecurringFailedBanner } from "@/components/recurring/recurring-failed-banner";
import { AddTransactionButton } from "@/components/transactions/add-transaction-button";
import { CategoryFilterChip } from "@/components/transactions/category-filter-chip";
import { ExportMenu } from "@/components/transactions/export-menu";
import { MonthSelect } from "@/components/transactions/month-select";
import { SummaryCards } from "@/components/transactions/summary-cards";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionSearch } from "@/components/transactions/transaction-search";
import { TypeTabs } from "@/components/transactions/type-tabs";
import { parseMonthParam, parseTypeParam } from "@/lib/format";
import { getCategories } from "@/lib/queries/categories";
import { ensureRecurringGenerated } from "@/lib/queries/recurring";
import { getTransactionsByMonth } from "@/lib/queries/transactions";
import type { TransactionWithCategory } from "@/lib/types";

/**
 * 거래 내역을 날짜별로 그룹화
 */
function groupByDate(transactions: TransactionWithCategory[]) {
  const map = new Map<string, TransactionWithCategory[]>();
  for (const tx of transactions) {
    const list = map.get(tx.date) ?? [];
    list.push(tx);
    map.set(tx.date, list);
  }
  return [...map]; // 이미 date DESC 정렬돼서 옴 → Map이 삽입 순서 유지
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    type?: string;
    q?: string;
    category?: string;
  }>;
}) {
  const params = await searchParams;

  // 검증: 형식이 어긋나면 기본값으로 (URL은 사용자 입력이다)
  const month = parseMonthParam(params.month);
  const type = parseTypeParam(params.type);
  const search = params.q?.trim() || undefined;
  const rawCategoryId = z.string().uuid().safeParse(params.category).success
    ? params.category
    : undefined;

  // 조회 전에 이번 달 반복 거래를 먼저 생성 (없으면 no-op)
  const recurringOk = await ensureRecurringGenerated();

  // 카테고리는 먼저 가져와 소유 여부를 확인 — 남의 uuid면 필터 자체를 무시
  // (칩이 안 보이는데 목록만 비는 혼란 방지)
  const categories = await getCategories();
  const filterCategory = rawCategoryId
    ? categories.find((c) => c.id === rawCategoryId)
    : undefined;

  const monthTransactions = await getTransactionsByMonth(
    month,
    search,
    filterCategory?.id,
  );

  const truncated = !!search && monthTransactions.length > 100;
  const shown = truncated ? monthTransactions.slice(0, 100) : monthTransactions;

  const filtered = type ? shown.filter((tx) => tx.type === type) : shown;
  const groups = groupByDate(filtered);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold text-foreground">
          거래 내역
        </h1>
        <div className="flex items-center gap-2.5">
          <TransactionSearch initial={search ?? ""} />
          <ExportMenu month={month} />
          <AddTransactionButton categories={categories} />
        </div>
      </div>

      {!recurringOk && <RecurringFailedBanner />}

      {!search && <SummaryCards transactions={filtered} />}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <TypeTabs />
          {filterCategory && <CategoryFilterChip category={filterCategory} />}
        </div>
        {!search && <MonthSelect month={month} />}
      </div>

      {truncated && (
        <p className="rounded-lg bg-warning-bg px-3.5 py-2.5 text-[13px] font-semibold text-warning">
          검색 결과가 많아 최근 100건까지만 찾았어요. 검색어를 더 구체적으로
          입력해 보세요.
        </p>
      )}

      <div className="rounded-2xl bg-card px-6 pb-2 shadow-card">
        {groups.length === 0 ? (
          <EmptyState
            icon={search ? "search_off" : "receipt_long"}
            title={search ? "검색 결과가 없어요" : "거래 내역이 없어요"}
            description={
              search
                ? "다른 검색어로 찾아보세요."
                : "다른 달을 선택하거나 새 거래를 입력해 보세요."
            }
          />
        ) : (
          <TransactionList groups={groups} categories={categories} />
        )}
      </div>
    </div>
  );
}
