## 환경변수

`.env.example`을 `.env.local`로 복사하고 값을 채우세요.

| 변수 | 설명 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable(anon) 키 |
| `NEXT_PUBLIC_SITE_URL` | 앱 기본 URL. 비밀번호 재설정 메일의 링크 생성에 사용 (프로덕션은 배포 도메인) |

Supabase 대시보드 → Authentication → URL Configuration → Redirect URLs 에
`{SITE_URL}/auth/callback` 등록 필요.
