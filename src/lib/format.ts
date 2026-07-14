import { format, isToday, isYesterday, parse } from "date-fns";
import { ko } from "date-fns/locale";

/** 1234567 → '1,234,567' — 통화 기호 없이 천 단위 구분만 (기호는 호출부에서 조합) */
export function formatAmount(amount: number) {
  return new Intl.NumberFormat("ko-KR").format(amount);
}

/** 오늘 날짜를 'YYYY-MM-DD' 형식으로 반환 */
export function today() {
  return new Date().toLocaleDateString("sv-SE"); // 'YYYY-MM-DD' 로컬 기준
}

/** 'YYYY-MM-DD' → Date (타임존 밀림 없음) */
export function parseDate(date: string) {
  return parse(date, "yyyy-MM-dd", new Date());
}

/** 'YYYY-MM-DD' → 'M월 d일' */
export function formatDate(date: string) {
  return format(parseDate(date), "M월 d일", { locale: ko });
}

/** '오늘' | '어제' | '수요일' */
export function formatDayLabel(date: string) {
  const d = parseDate(date);
  if (isToday(d)) return "오늘";
  if (isYesterday(d)) return "어제";
  return format(d, "EEEE", { locale: ko });
}

/** Date → 'YYYY-MM-DD' */
export function toDateString(date: Date) {
  return format(date, "yyyy-MM-dd");
}
