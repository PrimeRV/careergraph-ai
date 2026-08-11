export default function Loading() {
  return (
    <main className="min-h-screen bg-[#09090f] text-white">
      <div className="flex min-h-screen">
        {/* Sidebar skeleton */}
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#0d0d15] p-4 md:flex md:flex-col">
          <div className="flex items-center gap-3 px-3 py-4">
            <div className="h-9 w-9 animate-pulse rounded-xl bg-violet-600/40" />

            <div>
              <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
              <div className="mt-2 h-3 w-24 animate-pulse rounded bg-white/5" />
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map((item) => (
              <div
                key={item}
                className="h-10 animate-pulse rounded-lg bg-white/[0.03]"
              />
            ))}
          </div>
        </aside>

        {/* Main */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="flex min-h-16 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6 md:px-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-white/10" />

              <div>
                <div className="h-3 w-24 animate-pulse rounded bg-violet-500/20" />
                <div className="mt-2 h-4 w-28 animate-pulse rounded bg-white/10" />
              </div>
            </div>

            <div className="hidden h-9 w-72 animate-pulse rounded-lg bg-white/[0.04] md:block" />
          </header>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6 md:p-8">
            <div className="mx-auto w-full max-w-[1200px]">
              
              {/* Loading message */}
              <div className="flex min-h-[300px] flex-col items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-violet-500" />

                <p className="mt-5 text-sm font-medium text-zinc-300">
                  Loading Applications...
                </p>

                <p className="mt-2 text-xs text-zinc-600">
                  Fetching your career applications
                </p>
              </div>

              {/* Skeleton cards */}
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-xl bg-white/10" />

                      <div className="flex-1">
                        <div className="h-4 w-48 rounded bg-white/10" />
                        <div className="mt-2 h-3 w-32 rounded bg-white/5" />
                      </div>

                      <div className="h-7 w-20 rounded-full bg-white/10" />
                    </div>

                    <div className="mt-6 h-px bg-white/5" />

                    <div className="mt-5 grid grid-cols-4 gap-3">
                      <div className="h-3 rounded bg-white/5" />
                      <div className="h-3 rounded bg-white/5" />
                      <div className="h-3 rounded bg-white/5" />
                      <div className="h-3 rounded bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}