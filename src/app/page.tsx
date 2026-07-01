export default function Home() {
  return (
    <main className="min-h-screen bg-background p-10">
      <div className="rounded-2xl bg-card p-6 shadow-card">
        <p className="text-2xl font-bold text-foreground">이번 달 총 지출</p>
        <p className="mt-2 text-income">+ 1,200,000원</p>
        <p className="text-expense">- 1,472,000원</p>
        <button
          type="button"
          className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          거래 추가
        </button>
      </div>
    </main>
  );
}
