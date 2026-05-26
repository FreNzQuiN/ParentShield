function SkeletonBar({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-bg-tag ${className ?? ''}`} />;
}

export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <section className="pb-2">
        <SkeletonBar className="mb-2 h-7 w-56" />
        <SkeletonBar className="h-4 w-72" />
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-[rgba(193,198,214,0.2)] bg-bg-card p-4 md:p-5">
            <div className="flex items-start gap-3 md:gap-4">
              <SkeletonBar className="h-9 w-9 shrink-0 rounded-lg md:h-10 md:w-10" />
              <div className="min-w-0 flex-1 text-right">
                <SkeletonBar className="mb-2 h-3 w-20 ml-auto" />
                <SkeletonBar className="mb-1 h-7 w-16 ml-auto" />
                <SkeletonBar className="h-3 w-32 ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-5 md:grid md:grid-cols-3 md:gap-6">
        <div className="flex flex-col gap-5 md:col-span-2 md:gap-6">
          <div className="rounded-xl border border-[rgba(193,198,214,0.2)] bg-bg-card p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
            <SkeletonBar className="mb-3 h-5 w-32" />
            <SkeletonBar className="h-[200px] w-full rounded-lg" />
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:gap-4">
            <div className="flex-1 rounded-xl border border-[rgba(193,198,214,0.2)] bg-bg-card p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
              <SkeletonBar className="mb-4 h-4 w-36" />
              {[1, 2, 3].map((j) => (
                <div key={j} className="mb-3 flex items-center gap-2">
                  <SkeletonBar className="h-2 flex-1" />
                  <SkeletonBar className="h-5 w-10 shrink-0" />
                </div>
              ))}
            </div>
            <div className="flex-1 rounded-xl border border-[rgba(193,198,214,0.2)] bg-bg-card p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
              <SkeletonBar className="mb-4 h-4 w-36" />
              {[1, 2, 3].map((j) => (
                <div key={j} className="mb-3 flex items-center gap-2">
                  <SkeletonBar className="h-2 flex-1" />
                  <SkeletonBar className="h-5 w-10 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5 md:col-span-1 md:gap-6">
          <SkeletonBar className="h-52 rounded-xl" />
          <SkeletonBar className="h-44 rounded-xl" />
        </div>
      </section>
    </div>
  );
}
