export default function AppLoading() {
  return (
    <main className="min-h-screen bg-[#F7F9FC] px-4 py-5">
      <div className="mx-auto max-w-[1480px] space-y-5">
        <div className="h-20 animate-pulse rounded-[22px] border border-slate-200 bg-white" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-[22px] border border-slate-200 bg-white" />
          ))}
        </div>
        <div className="h-[420px] animate-pulse rounded-[26px] border border-slate-200 bg-white" />
      </div>
    </main>
  );
}
