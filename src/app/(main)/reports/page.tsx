import { format, parse, subMonths } from "date-fns";
import type { Metadata } from "next";
import { EmptyState } from "@/components/common/empty-state";
import { MonthNav } from "@/components/common/month-nav";
import { CategoryRanking } from "@/components/reports/category-ranking";
import { PeriodTabs } from "@/components/reports/period-tabs";
import { ReportSummaryCards } from "@/components/reports/report-summary-cards";
import { TypeTrendChart } from "@/components/reports/type-trend-chart";
import { YearNav } from "@/components/reports/year-nav";
import { YearlyTable } from "@/components/reports/yearly-table";
import type { CategoryTotal } from "@/lib/aggregate";
import { joinCategoryTotals, totalsByCategory } from "@/lib/aggregate";
import { TRANSACTION_TYPE_LABEL, TRANSACTION_TYPES } from "@/lib/constants";
import {
  currentMonthKST,
  parseMonthParam,
  parsePeriodParam,
} from "@/lib/format";
import { getCategories } from "@/lib/queries/categories";
import type { MonthlyTotal } from "@/lib/queries/transactions";
import {
  getCategoryTotals,
  getMonthlyTotals,
  getTransactionsByMonth,
} from "@/lib/queries/transactions";
import type { TransactionType } from "@/lib/types";

export const metadata: Metadata = { title: "리포트" };

type PerType<T> = Record<TransactionType, T>;

/** 세 타입 키를 모두 채운 Record 생성 — 키 누락을 타입으로 차단 */
function perType<T>(build: (type: TransactionType) => T): PerType<T> {
  return {
    income: build("income"),
    expense: build("expense"),
    saving: build("saving"),
  };
}

type ReportData = {
  rankings: PerType<CategoryTotal[]>;
  prevRankings: PerType<Map<string, number>>;
  sums: PerType<number>;
  prevSums: PerType<number>;
  trend: PerType<MonthlyTotal[]>;
};

/** 연간: SQL 집계만 — 1년치 원본은 PostgREST max-rows에 걸리므로 가져오지 않음 */
async function getYearlyReport(year: string): Promise<ReportData> {
  const prevYear = String(Number(year) - 1);

  // 진행 중인 해는 올해 합계가 1월~이번 달까지의 부분합이므로
  // 전년도 같은 기간과 비교해야 증감이 왜곡되지 않는다.
  // 추이 차트·월별 표도 아직 오지 않은 달은 잘라낸다.
  const nowMonth = currentMonthKST();
  const isCurrentYear = year === nowMonth.slice(0, 4);
  const prevEndMonth = isCurrentYear
    ? `${prevYear}-${nowMonth.slice(5)}`
    : `${prevYear}-12`;

  const [categories, ...results] = await Promise.all([
    getCategories(),
    ...TRANSACTION_TYPES.map(async (type) => {
      const [current, previous, monthly] = await Promise.all([
        getCategoryTotals({
          startMonth: `${year}-01`,
          endMonth: `${year}-12`,
          type,
        }),
        getCategoryTotals({
          startMonth: `${prevYear}-01`,
          endMonth: prevEndMonth,
          type,
        }),
        getMonthlyTotals({ count: 12, baseMonth: `${year}-12`, type }),
      ]);
      return [
        type,
        {
          current,
          previous,
          monthly: isCurrentYear
            ? monthly.filter((m) => m.month <= nowMonth)
            : monthly,
        },
      ] as const;
    }),
  ]);
  const byType = new Map(results);
  const of = (type: TransactionType) => {
    const r = byType.get(type);
    if (!r) throw new Error(`집계 누락: ${type}`);
    return r;
  };

  return {
    rankings: perType((t) => joinCategoryTotals(of(t).current, categories)),
    prevRankings: perType(
      (t) =>
        new Map(
          of(t).previous.map(
            (r) => [r.category_id ?? "none", r.total] as const,
          ),
        ),
    ),
    sums: perType((t) => of(t).current.reduce((s, r) => s + r.total, 0)),
    prevSums: perType((t) => of(t).previous.reduce((s, r) => s + r.total, 0)),
    trend: perType((t) => of(t).monthly),
  };
}

/** 월간: 이번 달·전월 거래를 통째로 가져와 타입별로 JS 집계 (한 달치는 유계) */
async function getMonthlyReport(month: string): Promise<ReportData> {
  const prevMonth = format(
    subMonths(parse(month, "yyyy-MM", new Date()), 1),
    "yyyy-MM",
  );

  const [current, previous, ...monthlies] = await Promise.all([
    getTransactionsByMonth(month),
    getTransactionsByMonth(prevMonth),
    ...TRANSACTION_TYPES.map((type) =>
      getMonthlyTotals({ count: 3, baseMonth: month, type }),
    ),
  ]);

  const rankings = perType((t) => totalsByCategory(current, t));
  const prevTotals = perType((t) => totalsByCategory(previous, t));

  return {
    rankings,
    prevRankings: perType(
      (t) => new Map(prevTotals[t].map((x) => [x.id, x.total] as const)),
    ),
    sums: perType((t) => rankings[t].reduce((s, x) => s + x.total, 0)),
    prevSums: perType((t) => prevTotals[t].reduce((s, x) => s + x.total, 0)),
    trend: perType((t) => monthlies[TRANSACTION_TYPES.indexOf(t)]),
  };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; period?: string }>;
}) {
  const params = await searchParams;
  const month = parseMonthParam(params.month);
  const period = parsePeriodParam(params.period);

  const { rankings, prevRankings, sums, prevSums, trend } =
    period === "yearly"
      ? await getYearlyReport(month.slice(0, 4))
      : await getMonthlyReport(month);

  // ── 공통 파생값 ──────────────────────────────
  const periodLabel =
    period === "yearly"
      ? `${month.slice(0, 4)}년`
      : format(parse(month, "yyyy-MM", new Date()), "M월");
  const compareLabel = period === "yearly" ? "작년" : "지난달";
  const isEmpty = TRANSACTION_TYPES.every((t) => rankings[t].length === 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold text-foreground">리포트</h1>
        <div className="flex items-center gap-2.5">
          <PeriodTabs />
          {period === "yearly" ? (
            <YearNav month={month} />
          ) : (
            <MonthNav month={month} />
          )}
        </div>
      </div>

      <ReportSummaryCards
        sums={sums}
        prevSums={prevSums}
        compareLabel={compareLabel}
      />

      {/* 추이 차트 */}
      <section className="rounded-2xl bg-card p-6 shadow-card">
        <h2 className="text-[16px] font-bold text-foreground">
          {periodLabel} {period === "yearly" ? "월별 추이" : "최근 3개월 비교"}
        </h2>
        <TypeTrendChart
          income={trend.income}
          expense={trend.expense}
          saving={trend.saving}
        />
      </section>

      {period === "yearly" && (
        <YearlyTable
          income={trend.income}
          expense={trend.expense}
          saving={trend.saving}
        />
      )}

      {/* 카테고리 순위 — 지출 | 수입 | 저축 3열 */}
      {isEmpty ? (
        <div className="rounded-2xl bg-card shadow-card">
          <EmptyState
            icon="monitoring"
            title="집계할 내역이 없어요"
            description="거래를 입력하면 리포트가 만들어져요."
          />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {TRANSACTION_TYPES.map((type) => (
            <CategoryRanking
              key={type}
              title={`${TRANSACTION_TYPE_LABEL[type]} 순위`}
              totals={rankings[type]}
              previousTotals={prevRankings[type]}
              type={type}
            />
          ))}
        </div>
      )}
    </div>
  );
}
