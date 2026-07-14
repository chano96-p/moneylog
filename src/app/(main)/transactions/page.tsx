import { EmptyState } from "@/components/common/empty-state";
import { TransactionFormModal } from "@/components/transactions/transaction-form-modal";
import { TransactionGroup } from "@/components/transactions/transaction-group";
import { getCategories } from "@/lib/queries/categories";
import { getTransactions } from "@/lib/queries/transactions";
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

export default async function TransactionsPage() {
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ]);

  const groups = groupByDate(transactions);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold text-foreground">
          거래 내역
        </h1>
        <TransactionFormModal categories={categories} />
      </div>

      <div className="rounded-2xl bg-card px-6 pb-2 shadow-card">
        {groups.length === 0 ? (
          <EmptyState
            icon="receipt_long"
            title="아직 거래 내역이 없어요"
            description="첫 거래를 입력하면 여기에 표시돼요."
          />
        ) : (
          groups.map(([date, txs]) => (
            <TransactionGroup key={date} date={date} transactions={txs} />
          ))
        )}
      </div>
    </div>
  );
}
