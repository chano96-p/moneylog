import { formatAmount } from "@/lib/format";
import type { MonthlyTotal } from "@/lib/queries/transactions";

type YearlyTableProps = {
  /** 세 배열 모두 1~12월 순서, 같은 길이 */
  income: MonthlyTotal[];
  expense: MonthlyTotal[];
  saving: MonthlyTotal[];
};

/** 편한가계부식 월별 표 — 수입/지출/저축/잔액, 마지막 행은 연간 합계 */
export function YearlyTable({ income, expense, saving }: YearlyTableProps) {
  const rows = income.map((inc, i) => {
    const exp = expense[i]?.total ?? 0;
    const sav = saving[i]?.total ?? 0;
    return {
      month: inc.month,
      income: inc.total,
      expense: exp,
      saving: sav,
      balance: inc.total - exp - sav,
    };
  });

  const sum = rows.reduce(
    (acc, r) => ({
      income: acc.income + r.income,
      expense: acc.expense + r.expense,
      saving: acc.saving + r.saving,
      balance: acc.balance + r.balance,
    }),
    { income: 0, expense: 0, saving: 0, balance: 0 },
  );

  const cell = "px-3 py-2.5 text-right text-[13px] tabular-nums";

  return (
    <section className="rounded-2xl bg-card p-6 shadow-card">
      <h2 className="text-[16px] font-bold text-foreground">월별 내역</h2>

      <table className="mt-3 w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-100 text-muted-foreground">
            <th className="px-3 py-2.5 text-left text-[13px] font-semibold">
              월
            </th>
            <th className={`${cell} font-semibold`}>수입</th>
            <th className={`${cell} font-semibold`}>지출</th>
            <th className={`${cell} font-semibold`}>저축</th>
            <th className={`${cell} font-semibold`}>잔액</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const empty = r.income === 0 && r.expense === 0 && r.saving === 0;
            return (
              <tr
                key={r.month}
                className={`border-b border-gray-100 last:border-b-0 ${
                  empty ? "text-gray-300" : "text-foreground"
                }`}
              >
                <td className="px-3 py-2.5 text-left text-[13px] font-semibold">
                  {Number(r.month.slice(5))}월
                </td>
                <td className={`${cell} ${empty ? "" : "text-income"}`}>
                  {formatAmount(r.income)}
                </td>
                <td className={cell}>{formatAmount(r.expense)}</td>
                <td className={`${cell} ${empty ? "" : "text-saving"}`}>
                  {formatAmount(r.saving)}
                </td>
                <td className={`${cell} font-semibold`}>
                  {r.balance < 0 && "-"}
                  {formatAmount(Math.abs(r.balance))}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 font-bold text-foreground">
            <td className="px-3 py-3 text-left text-[13px]">합계</td>
            <td className={`${cell} text-income`}>
              {formatAmount(sum.income)}
            </td>
            <td className={cell}>{formatAmount(sum.expense)}</td>
            <td className={`${cell} text-saving`}>
              {formatAmount(sum.saving)}
            </td>
            <td className={cell}>
              {sum.balance < 0 && "-"}
              {formatAmount(Math.abs(sum.balance))}
            </td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}
