function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`환경변수 ${key}가 설정되지 않았습니다.`);
  }
  return value;
}

export const env = {
  NEXT_PUBLIC_SITE_URL: getEnv("NEXT_PUBLIC_SITE_URL"),
  SUPABASE_URL: getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  SUPABASE_PUBLISHABLE_KEY: getEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
};
