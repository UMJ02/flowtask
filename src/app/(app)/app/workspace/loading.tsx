export default function WorkspaceLoading() {
  return (
    <main className="ft-ws-shell min-h-screen p-5 md:p-8">
      <section className="ft-ws-card mx-auto max-w-5xl p-5">
        <div className="h-7 w-44 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-5 grid gap-4 md:grid-cols-[260px_1fr]">
          <div className="space-y-3 rounded-[24px] bg-slate-100/80 p-4">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-[14px] bg-white" />
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-28 animate-pulse rounded-[28px] bg-white" />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="h-32 animate-pulse rounded-[24px] bg-white" />
              <div className="h-32 animate-pulse rounded-[24px] bg-white" />
              <div className="h-32 animate-pulse rounded-[24px] bg-white" />
            </div>
            <div className="h-80 animate-pulse rounded-[28px] bg-white" />
          </div>
        </div>
      </section>
    </main>
  );
}
