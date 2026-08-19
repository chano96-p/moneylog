import { endOfMonth, parse } from "date-fns";
import { TRANSACTION_TYPE_LABEL } from "@/lib/constants";
import { escapeCsv } from "@/lib/csv";
import { toDateString } from "@/lib/format";
import { monthSchema } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/server";
import type { TransactionType } from "@/lib/types";

const HEADER = ["날짜", "타입", "카테고리", "금액", "메모"];

// PostgREST 기본 max-rows(1000)에서 응답이 조용히 잘리므로
// 백업 용도인 내보내기는 이 크기로 끝까지 순회해 전량 수집한다.
const PAGE_SIZE = 1000;

type ExportRow = {
  date: string;
  type: string;
  amount: number;
  memo: string | null;
  category: { name: string } | null;
};

/**
 * GET /api/export            → 전체 기간
 * GET /api/export?month=YYYY-MM → 해당 월
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const rawMonth = new URL(request.url).searchParams.get("month");
  const month = monthSchema.safeParse(rawMonth).success ? rawMonth : null;

  const all: ExportRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    let query = supabase
      .from("transactions")
      .select("date, type, amount, memo, category:categories(name)")
      .order("date", { ascending: true })
      .order("created_at", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (month) {
      const start = parse(month, "yyyy-MM", new Date());
      query = query
        .gte("date", toDateString(start))
        .lte("date", toDateString(endOfMonth(start)));
    }

    const { data, error } = await query;
    if (error) return new Response("Failed", { status: 500 });

    const page = (data ?? []) as ExportRow[];
    all.push(...page);
    if (page.length < PAGE_SIZE) break;
  }

  const rows = all.map((tx) =>
    [
      tx.date,
      TRANSACTION_TYPE_LABEL[tx.type as TransactionType],
      tx.category?.name ?? "미분류",
      String(tx.amount),
      tx.memo ?? "",
    ]
      .map(escapeCsv)
      .join(","),
  );

  // BOM — 한글 Excel이 UTF-8로 인식하게
  const csv = `﻿${[HEADER.join(","), ...rows].join("\r\n")}`;
  const filename = month ? `moneylog-${month}.csv` : "moneylog-all.csv";

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
