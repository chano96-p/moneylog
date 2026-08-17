import { CategoryMenu } from "@/components/categories/category-menu";
import { Icon } from "@/components/common/icon";
import { formatAmount } from "@/lib/format";
import type { Category } from "@/lib/types";

type CategoryCardProps = {
  category: Category;
  monthTotal: number;
  budget: number | null;
  month: string;
  transactionCount: number;
};

export function CategoryCard({
  category,
  monthTotal,
  budget,
  month,
  transactionCount,
}: CategoryCardProps) {
  const isExpense = category.type === "expense";
  const ratio = budget && budget > 0 ? monthTotal / budget : null;
  const over = ratio !== null && ratio > 1;

  return (
    <div className="flex flex-col rounded-xl bg-card p-5 shadow-card">
      {/* 아이콘 + 메뉴 */}
      <div className="flex items-start justify-between">
        <div
          className="flex size-11.5 items-center justify-center rounded-lg"
          style={{
            backgroundColor: `color-mix(in srgb, ${category.color} 12%, transparent)`,
          }}
        >
          <Icon name={category.icon} size={24} color={category.color} />
        </div>

        <CategoryMenu
          category={category}
          month={month}
          budget={budget}
          transactionCount={transactionCount}
        />
      </div>

      <p className="pt-3 text-[16px] font-bold text-foreground">
        {category.name}
      </p>

      {isExpense ? (
        <>
          <p className="pb-2 text-[13px] font-semibold text-muted-foreground tabular-nums">
            {budget === null ? (
              <>
                {formatAmount(monthTotal)}원{" "}
                <span className="font-normal text-gray-400">· 예산 미설정</span>
              </>
            ) : (
              <>
                <span className={over ? "text-expense" : undefined}>
                  {formatAmount(monthTotal)}
                </span>{" "}
                / {formatAmount(budget)}원
              </>
            )}
          </p>

          <div className="h-1.5 w-full overflow-hidden rounded-[4px] bg-gray-100">
            {ratio !== null && (
              <div
                className="h-full rounded-[4px]"
                style={{
                  width: `${Math.min(ratio, 1) * 100}%`,
                  backgroundColor: over ? "var(--expense)" : category.color,
                }}
              />
            )}
          </div>
        </>
      ) : category.type === "saving" ? (
        <p className="pb-2 text-[13px] font-semibold text-saving tabular-nums">
          이번 달 {formatAmount(monthTotal)}원 저축
        </p>
      ) : (
        <p className="pb-2 text-[13px] font-semibold text-income tabular-nums">
          이번 달 +{formatAmount(monthTotal)}원
        </p>
      )}
    </div>
  );
}
