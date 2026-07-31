import z from "zod";
import { CATEGORY_COLORS, MAX_TRANSACTION_AMOUNT } from "./constants";

// 거래 입력 스키마
export const transactionInputSchema = z.object({
  type: z.enum(["income", "expense"]),
  category_id: z.string().uuid().nullable(),
  amount: z
    .number()
    .int()
    .positive("금액을 입력해 주세요.")
    .max(MAX_TRANSACTION_AMOUNT, "금액이 너무 커요."),
  date: z.iso.date({ error: "날짜를 선택해 주세요." }),
  memo: z
    .string()
    .trim()
    .max(100, "메모는 100자 이내로 입력해 주세요.")
    .nullable(),
});

export type TransactionInput = z.infer<typeof transactionInputSchema>;

export const transactionUpdateSchema = transactionInputSchema.extend({
  id: z.string().uuid(),
});

export type TransactionUpdateInput = z.infer<typeof transactionUpdateSchema>;

export const categoryInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "이름을 입력해 주세요.")
    .max(20, "이름은 20자 이내로 입력해 주세요."),
  icon: z.string().min(1, "아이콘을 선택해 주세요."),
  color: z.enum(CATEGORY_COLORS, { error: "색상을 선택해 주세요." }),
  type: z.enum(["income", "expense"]),
  /** 해당 월 예산 (null이면 미설정) */
  budget: z
    .number()
    .int()
    .positive("예산은 1원 이상 입력해 주세요.")
    .max(MAX_TRANSACTION_AMOUNT, "예산이 너무 커요.")
    .nullable(),
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "월 형식이 올바르지 않아요."),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

/** 수정: id 추가, type은 변경 불가라 제외 */
export const categoryUpdateSchema = categoryInputSchema
  .omit({ type: true })
  .extend({ id: z.string().uuid() });

export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
