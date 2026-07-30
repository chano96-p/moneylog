import { format, isToday, isYesterday, parse } from "date-fns";
import { ko } from "date-fns/locale";

/** 이 앱의 '오늘'은 항상 KST 기준이다 (서버/클라이언트 무관) */
export function todayKST() {
  // sv-SE 로케일 = ISO 형식(YYYY-MM-DD), timeZone으로 KST 고정
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
  }).format(new Date());
}

/** 'YYYY-MM' (KST 기준 이번 달) */
export function currentMonthKST() {
  return todayKST().slice(0, 7);
}

/** 1234567 → '1,234,567' — 통화 기호 없이 천 단위 구분만 (기호는 호출부에서 조합) */
export function formatAmount(amount: number) {
  return new Intl.NumberFormat("ko-KR").format(amount);
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

/** searchParams의 month를 검증 — 형식이 어긋나면 이번 달(KST) */
export function parseMonthParam(raw?: string) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(raw ?? "")
    ? (raw as string)
    : currentMonthKST();
}

/** 1,472,000 → '147만원' (도넛 중앙 축약 표기) */
export function formatAmountShort(amount: number) {
  if (amount >= 100_000_000)
    return `${formatAmount(Math.floor(amount / 100_000_000))}억원`;
  if (amount < 10_000) return `${formatAmount(amount)}원`;
  return `${formatAmount(Math.floor(amount / 10_000))}만원`;
}
