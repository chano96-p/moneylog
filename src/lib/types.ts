import type { Database } from "@/lib/database.types";

export type TransactionType = "income" | "expense" | "saving";

export type Transaction = Omit<
  Database["public"]["Tables"]["transactions"]["Row"],
  "type"
> & { type: TransactionType };

export type Category = Omit<
  Database["public"]["Tables"]["categories"]["Row"],
  "type"
> & { type: TransactionType };

export type Budget = Database["public"]["Tables"]["budgets"]["Row"];

export type TransactionWithCategory = Transaction & {
  category: Pick<Category, "name" | "icon" | "color"> | null;
};
