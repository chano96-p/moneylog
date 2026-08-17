import { EmptyState } from "@/components/common/empty-state";
import { AddRecurringButton } from "@/components/recurring/add-recurring-button";
import { RecurringRuleList } from "@/components/recurring/recurring-rule-list";
import { formatAmount } from "@/lib/format";
import { getCategories } from "@/lib/queries/categories";
import { getRecurringRules } from "@/lib/queries/recurring";

export default async function RecurringPage() {
  const [rules, categories] = await Promise.all([
    getRecurringRules(),
    getCategories(),
  ]);

  const active = rules.filter((r) => r.is_active);
  const monthlyExpense = active
    .filter((r) => r.type === "expense")
    .reduce((s, r) => s + r.amount, 0);
  const monthlyIncome = active
    .filter((r) => r.type === "income")
    .reduce((s, r) => s + r.amount, 0);
  const monthlySaving = active
    .filter((r) => r.type === "saving")
    .reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold text-foreground">
            반복 거래
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            월세, 구독료, 적금처럼 매달 반복되는 거래를 자동으로 기록해요
          </p>
        </div>
        <AddRecurringButton categories={categories} />
      </div>

      {rules.length > 0 && (
        <div className="flex gap-3.5">
          <SummaryCard label="매월 고정 지출" className="text-foreground">
            -{formatAmount(monthlyExpense)}원
          </SummaryCard>
          <SummaryCard label="매월 고정 수입" className="text-income">
            +{formatAmount(monthlyIncome)}원
          </SummaryCard>
          <SummaryCard label="매월 고정 저축" className="text-saving">
            -{formatAmount(monthlySaving)}원
          </SummaryCard>
        </div>
      )}

      <div className="rounded-2xl bg-card px-6 pt-2 pb-2 shadow-card">
        {rules.length === 0 ? (
          <EmptyState
            icon="event_repeat"
            title="등록된 반복 거래가 없어요"
            description="등록하면 매달 1일 이후 첫 방문 때 자동으로 거래가 추가돼요."
          />
        ) : (
          <RecurringRuleList rules={rules} categories={categories} />
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1.75 rounded-2xl bg-card px-5 py-4.5 shadow-card">
      <p className="text-[13px] font-semibold text-muted-foreground">{label}</p>
      <p className={`text-[22px] font-extrabold tabular-nums ${className}`}>
        {children}
      </p>
    </div>
  );
}
