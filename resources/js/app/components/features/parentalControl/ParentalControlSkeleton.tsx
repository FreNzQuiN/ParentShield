function SkeletonBar({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-bg-tag ${className ?? ''}`} />;
}

export default function ParentalControlSkeleton() {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
      <div className="w-full shrink-0 rounded-xl border border-border/20 bg-bg-card p-4 lg:w-72">
        <SkeletonBar className="mb-4 h-5 w-32" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-border/10 p-3">
              <div>
                <SkeletonBar className="mb-1 h-4 w-28" />
                <SkeletonBar className="h-3 w-36" />
              </div>
              <SkeletonBar className="h-6 w-10 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-5">
        <div className="rounded-xl border border-border/20 bg-bg-card p-4">
          <SkeletonBar className="mb-4 h-5 w-40" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="mb-3 flex items-center justify-between rounded-lg border border-border/10 p-3">
              <div className="flex items-center gap-3">
                <SkeletonBar className="h-6 w-6 rounded" />
                <SkeletonBar className="h-4 w-24" />
              </div>
              <SkeletonBar className="h-3 w-12" />
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border/20 bg-bg-card p-4">
          <SkeletonBar className="mb-4 h-5 w-44" />
          <SkeletonBar className="mb-3 h-8 w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-border/10 p-2">
                <SkeletonBar className="h-4 w-4 shrink-0 rounded" />
                <SkeletonBar className="h-3 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}