import { EmptyState } from "@/components/common/empty-state";
import { TransactionRow } from "@/components/transactions/transaction-row";
import { getTransactions } from "@/lib/queries/transactions";

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">거래 내역</h1>

      <div className="rounded-2xl bg-white shadow-sm">
        {transactions.length === 0 ? (
          <EmptyState
            icon="receipt_long"
            title="아직 거래 내역이 없어요"
            description="첫 거래를 입력하면 여기에 표시돼요."
          />
        ) : (
          <ul className="divide-y divide-neutral-100">
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
