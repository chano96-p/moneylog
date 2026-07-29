import { EmptyState } from "@/components/common/empty-state";
import { AddTransactionButton } from "@/components/transactions/add-transaction-button";
import { MonthSelect } from "@/components/transactions/month-select";
import { SummaryCards } from "@/components/transactions/summary-cards";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TypeTabs } from "@/components/transactions/type-tabs";
import { parseMonthParam } from "@/lib/format";
import { getCategories } from "@/lib/queries/categories";
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
  searchParams: Promise<{ month?: string; type?: string }>;
}) {
  const params = await searchParams;

  // 검증: 형식이 어긋나면 기본값으로 (URL은 사용자 입력이다)
  const month = parseMonthParam(params.month);
  const type =
    params.type === "income" || params.type === "expense" ? params.type : null;

  const [monthTransactions, categories] = await Promise.all([
    getTransactionsByMonth(month),
    getCategories(),
  ]);

  const filtered = type
    ? monthTransactions.filter((tx) => tx.type === type)
    : monthTransactions;
  const groups = groupByDate(filtered);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold text-foreground">
          거래 내역
        </h1>
        <AddTransactionButton categories={categories} />
      </div>

      <SummaryCards transactions={monthTransactions} />

      <div className="flex items-center justify-between">
        <TypeTabs />
        <MonthSelect month={month} />
      </div>

      <div className="rounded-2xl bg-card px-6 pb-2 shadow-card">
        {groups.length === 0 ? (
          <EmptyState
            icon="receipt_long"
            title="아직 거래 내역이 없어요"
            description="첫 거래를 입력하면 여기에 표시돼요."
          />
        ) : (
          <TransactionList groups={groups} categories={categories} />
        )}
      </div>
    </div>
  );
}
