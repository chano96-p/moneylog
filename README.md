# 머니로그 (MoneyLog)

돈의 흐름이 한눈에 보이는 PC 전용 개인 가계부

**[라이브 데모](https://moneylog-chano.vercel.app)**

> 데모 계정 — `demo@example.com` / `demo1234`
> 자유롭게 둘러보세요.

![대시보드](./docs/screenshot-dashboard.png)

## 기능

- **거래** — 입력·수정·삭제, 월별 조회, 수입/지출 필터, 메모 검색
- **대시보드** — 총 지출과 전월 대비 증감, 예산 진행률, 카테고리 도넛, 최근 거래, 월별 추이
- **카테고리** — 아이콘·색 지정, 카테고리별 월 예산 설정
- **예산** — 월 사용률과 카테고리별 진행 상황
- **리포트** — 전월 대비 비교, 3개월 추이, 카테고리 순위
- **인증** — 로그인/회원가입, 비밀번호 재설정·변경

| 거래 내역 | 리포트 |
|---|---|
| ![거래 내역](./docs/screenshot-transactions.png) | ![리포트](./docs/screenshot-reports.png) |

## 기술 스택

| 영역 | 사용 |
|---|---|
| 프레임워크 | Next.js 16 (App Router), React 19, TypeScript |
| 스타일 | Tailwind CSS v4, shadcn/ui (Radix) |
| 백엔드 | Supabase — PostgreSQL, Auth, RLS |
| 검증 · 차트 | Zod, Recharts, date-fns |
| 도구 | pnpm, Biome, Supabase CLI |

## 실행

```bash
pnpm install
cp .env.example .env.local   # 값 입력
pnpm dev
```

| 환경변수 | 설명 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable(anon) 키 |
| `NEXT_PUBLIC_SITE_URL` | 앱 기본 URL (비밀번호 재설정 메일 링크에 사용) |

Supabase 대시보드 → Authentication → URL Configuration에 `{SITE_URL}/auth/callback`을 Redirect URL로 등록해야 재설정 메일이 동작합니다.

**스키마 반영**

```bash
pnpm supabase link --project-ref <ref>
pnpm supabase db push
pnpm gen:types
```

## 구조

```
src/
├── app/
│   ├── (auth)/          로그인 · 회원가입 · 비밀번호 재설정
│   ├── (main)/          대시보드 · 거래 · 카테고리 · 예산 · 리포트 · 설정
│   └── auth/callback/   Supabase 인증 콜백
├── components/
│   ├── ui/              shadcn/ui
│   ├── common/          도메인 무관 컴포넌트
│   └── <도메인>/         transactions, categories, budgets, dashboard, reports
├── lib/
│   ├── actions/         Server Action (쓰기)
│   ├── queries/         데이터 조회 (읽기)
│   ├── types.ts         DB 생성 타입 기반 도메인 타입
│   ├── schemas.ts       Zod 스키마
│   └── format.ts        포맷 · 날짜 정책
└── hooks/
```

DB 스키마는 `supabase/migrations`로 버전 관리하고, TypeScript 타입은 `supabase gen types`로 생성합니다.

## 설계 노트

- **RLS로 데이터 격리** — 사용자별 접근 제어를 앱 코드가 아닌 DB 정책에 두어, 쿼리를 어디서 호출하든 자기 데이터만 접근됩니다.
- **쓰기/읽기 분리** — 변경은 Server Action(`lib/actions`), 조회는 서버 컴포넌트에서 호출하는 `lib/queries`로 분리해 데이터 흐름을 단방향으로 유지합니다.
- **월별 집계는 DB에서** — 월별 합계는 Postgres 함수(`monthly_totals` RPC)로 집계합니다. SECURITY INVOKER로 실행되어 RLS가 그대로 적용되고, 거래 전체를 앱으로 가져오지 않습니다.
