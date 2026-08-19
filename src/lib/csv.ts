/**
 * CSV 셀 이스케이프.
 * 1) 수식 접두(= + - @ 탭 CR)로 시작하면 공백을 앞에 붙여 텍스트로 고정 (CSV 인젝션 방어)
 * 2) 쉼표·따옴표·개행이 있으면 따옴표로 감싸고 내부 따옴표는 이중화 (RFC 4180)
 */
export function escapeCsv(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? ` ${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}
