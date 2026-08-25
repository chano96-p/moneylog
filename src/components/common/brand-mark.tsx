/**
 * 브랜드 마크 (₩) — 파비콘(src/app/icon.svg)과 동일한 path.
 * 폰트 글리프가 아니라 도형이라 어디서든 같은 모양으로 렌더된다.
 * 색은 currentColor — 부모의 text 색을 따른다.
 */
export function BrandMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="8 8 48 48"
      aria-hidden="true"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path strokeWidth="6" d="M14 17 L23 47 L32 21 L41 47 L50 17" />
      <path strokeWidth="5" d="M11 27 H53" />
      <path strokeWidth="5" d="M13 37 H51" />
    </svg>
  );
}
