import z from "zod";
import { MAX_TRANSACTION_AMOUNT } from "./constants";

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
