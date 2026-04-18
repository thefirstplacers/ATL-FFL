export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-card p-6 animate-pulse ${className}`}>
      <div className="h-4 w-1/3 bg-surface-hover rounded mb-3" />
      <div className="h-3 w-2/3 bg-surface-hover rounded mb-2" />
      <div className="h-3 w-1/2 bg-surface-hover rounded" />
    </div>
  );
}

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="glass-card p-4 animate-pulse">
      <div className="h-5 w-1/4 bg-surface-hover rounded mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-surface-hover" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 bg-surface-hover rounded" />
              <div className="h-2 w-1/5 bg-surface-hover rounded" />
            </div>
            <div className="h-3 w-16 bg-surface-hover rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 animate-pulse">
        <div className="h-10 w-64 bg-surface-hover rounded mb-3" />
        <div className="h-4 w-96 bg-surface-hover rounded" />
      </div>
      <SkeletonTable rows={6} />
    </div>
  );
}
