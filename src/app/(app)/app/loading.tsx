export default function AppLoading() {
  return (
    <main className="min-h-dvh bg-[#F7F9FC] px-4 py-3">
      <div className="mx-auto max-w-[1480px] space-y-3">
        <div className="h-10 animate-pulse rounded-[16px] border ft-border bg-white" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[56px] animate-pulse rounded-[16px] border ft-border bg-white" />
          ))}
        </div>
        <div className="h-[280px] animate-pulse rounded-[18px] border ft-border bg-white" />
      </div>
    </main>
  );
}
