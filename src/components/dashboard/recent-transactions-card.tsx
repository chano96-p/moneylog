import Link from "next/link";
import { Icon } from "@/components/common/icon";
import { TransactionRow } from "@/components/transactions/transaction-row";
import type { TransactionWithCategory } from "@/lib/types";

const LIMIT = 5;

export function RecentTransactionsCard({
  transactions,
}: {
  transactions: TransactionWithCategory[];
}) {
  const recent = transactions.slice(0, LIMIT);

  return (
    <section className="flex flex-col rounded-2xl bg-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-foreground">최근 거래</h2>
        <Link
          href="/transactions"
          className="flex items-center gap-0.5 text-[13px] font-semibold text-muted-foreground hover:text-gray-700"
        >
          전체
          <Icon name="chevron_right" size={16} color="currentColor" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-14">
          <Icon name="receipt_long" size={36} color="var(--gray-300)" />
          <p className="text-[14px] font-medium text-muted-foreground">
            이번 달 거래가 없어요
          </p>
        </div>
      ) : (
        <ul className="mt-1.5 flex-1">
          {recent.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} showDate />
          ))}
        </ul>
      )}
    </section>
  );
}
