import { format, parse } from "date-fns";
import { ko } from "date-fns/locale";

/** 1234567 → '1,234,567' — 통화 기호 없이 천 단위 구분만 (기호는 호출부에서 조합) */
export function formatAmount(amount: number) {
  return new Intl.NumberFormat("ko-KR").format(amount);
}

/** 'YYYY-MM-DD' → '7월 10일 (금)' — 타임존 영향 없이 로컬 파싱 */
export function formatDate(date: string, pattern = "M월 d일 (E)") {
  return format(parse(date, "yyyy-MM-dd", new Date()), pattern, { locale: ko });
}
