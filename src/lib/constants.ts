import type { TransactionType } from "./types";

export const TRANSACTION_TYPES = ["expense", "income"] as const;

export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  expense: "지출",
  income: "수입",
};

/** 수입만 그린, 지출은 기본 텍스트색 */
export const AMOUNT_COLOR: Record<TransactionType, string> = {
  expense: "text-foreground",
  income: "text-income",
};
