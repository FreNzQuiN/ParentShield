function SkeletonBar({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-bg-tag ${className ?? ''}`} />;
}

export default function DevicesSkeleton() {
  return (
    <div className="flex flex-col gap-12">
      <div>
        <SkeletonBar className="mb-2 h-7 w-56" />
        <SkeletonBar className="h-4 w-72" />
      </div>

      <SkeletonBar className="h-16 w-full rounded-xl" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/20 bg-bg-card p-5 shadow-[0px_4px_20px_-2px_rgba(0,91,192,0.15)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <SkeletonBar className="h-10 w-10 rounded-lg" />
                <div>
                  <SkeletonBar className="mb-2 h-4 w-28" />
                  <SkeletonBar className="h-3 w-20" />
                </div>
              </div>
              <SkeletonBar className="h-5 w-14 rounded-full" />
            </div>
            <div className="mt-4 flex items-center gap-4 border-t border-border/10 pt-4">
              <SkeletonBar className="h-3 w-24" />
              <SkeletonBar className="h-3 w-28" />
            </div>
            <div className="mt-3 flex gap-2">
              <SkeletonBar className="h-8 flex-1 rounded-lg" />
              <SkeletonBar className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}