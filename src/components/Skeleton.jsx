/**
 * Skeleton Loading Components
 * Placeholder UI while content loads
 */

export function SkeletonLine({ width = '100%', height = '1rem', className = '' }) {
    return (
        <div
            className={`animate-pulse bg-[var(--color-bg-secondary)] rounded ${className}`}
            style={{ width, height }}
        />
    );
}

export function SkeletonCircle({ size = '3rem', className = '' }) {
    return (
        <div
            className={`animate-pulse bg-[var(--color-bg-secondary)] rounded-full ${className}`}
            style={{ width: size, height: size }}
        />
    );
}

export function SkeletonCard({ className = '' }) {
    return (
        <div className={`glass-card p-4 sm:p-6 animate-pulse ${className}`}>
            <SkeletonLine width="40%" height="1.5rem" className="mb-4" />
            <div className="space-y-3">
                <SkeletonLine height="1rem" />
                <SkeletonLine width="80%" height="1rem" />
                <SkeletonLine width="60%" height="1rem" />
            </div>
        </div>
    );
}

export function SkeletonTableRow() {
    return (
        <div className="flex items-center gap-4 p-3 border-b border-[var(--color-border)]">
            <SkeletonCircle size="2rem" />
            <div className="flex-1 space-y-2">
                <SkeletonLine width="30%" height="0.875rem" />
                <SkeletonLine width="50%" height="0.75rem" />
            </div>
            <div className="text-right space-y-2">
                <SkeletonLine width="4rem" height="0.875rem" />
                <SkeletonLine width="3rem" height="0.75rem" />
            </div>
        </div>
    );
}

export function SkeletonTable({ rows = 5 }) {
    return (
        <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border)]">
                <SkeletonLine width="30%" height="1.25rem" />
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <SkeletonTableRow key={i} />
            ))}
        </div>
    );
}

export function SkeletonStats() {
    return (
        <div className="glass-card p-4 sm:p-6">
            <SkeletonLine width="50%" height="1.25rem" className="mb-4" />
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <SkeletonLine width="60%" height="0.75rem" />
                    <SkeletonLine width="80%" height="1.5rem" />
                </div>
                <div className="space-y-2">
                    <SkeletonLine width="60%" height="0.75rem" />
                    <SkeletonLine width="80%" height="1.5rem" />
                </div>
            </div>
        </div>
    );
}
