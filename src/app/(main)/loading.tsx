export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-100" />
      <div className="h-45 animate-pulse rounded-2xl bg-gray-100" />
      <div className="grid grid-cols-2 gap-5">
        <div className="h-70 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-70 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    </div>
  );
}
