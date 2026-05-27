export default function ActivitySkeleton() {
  return (
    <div className="rounded-xl bg-bg-card p-4 shadow-[0px_4px_20px_-2px_rgba(0,91,192,0.15)]">
      <div className="animate-pulse">
        <div className="mb-3 flex items-center border-b border-border/10 pb-3">
          <div className="h-3 w-[120px] rounded bg-bg-tag" />
          <div className="ml-auto h-3 w-[60px] rounded bg-bg-tag" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border/5 py-3"
          >
            <div className="h-4 w-48 rounded bg-bg-tag" />
            <div className="h-4 w-20 rounded bg-bg-tag" />
            <div className="h-4 w-24 rounded bg-bg-tag" />
            <div className="h-6 w-16 rounded-full bg-bg-tag" />
          </div>
        ))}
      </div>
    </div>
  );
}
