import type { TransactionType } from "./types";

export const TRANSACTION_TYPES = ["expense", "income", "saving"] as const;

export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  expense: "지출",
  income: "수입",
  saving: "저축",
};

/** 수입은 그린, 저축은 퍼플, 지출은 기본 텍스트색 */
export const AMOUNT_COLOR: Record<TransactionType, string> = {
  expense: "text-foreground",
  income: "text-income",
  saving: "text-saving",
};

export const MAX_TRANSACTION_AMOUNT = 999_999_999;

/** 카테고리 색 팔레트 (시안 고정 6색 = --cat-* 토큰) */
export const CATEGORY_COLORS = [
  "#ff8a3d", // transport
  "#3182f6", // home
  "#a855f7", // shopping
  "#f4a623", // food
  "#f04452", // culture
  "#1bc47d", // health
] as const;

/** 카테고리 아이콘 (Material Symbols Rounded) */
export const CATEGORY_ICONS = [
  "restaurant",
  "directions_bus",
  "shopping_bag",
  "home",
  "movie",
  "flight",
  "pets",
  "health_and_safety",
  "school",
  "fitness_center",
  "local_cafe",
  "payments",
  "savings",
  "receipt_long",
  "card_giftcard",
  "more_horiz",
] as const;
