import { useState, useRef, useCallback } from 'react';
import { hapticMedium } from '../utils/haptics';

/**
 * Pull-to-Refresh wrapper component
 * Wraps content and enables pull-down gesture to trigger refresh
 */
export default function PullToRefresh({ children, onRefresh, disabled = false }) {
    const [isPulling, setIsPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const startY = useRef(0);
    const containerRef = useRef(null);

    const THRESHOLD = 80; // Distance needed to trigger refresh
    const MAX_PULL = 120;

    const handleTouchStart = useCallback((e) => {
        if (disabled || isRefreshing) return;
        // Only enable pull-to-refresh at top of page
        if (window.scrollY > 5) return;

        startY.current = e.touches[0].clientY;
        setIsPulling(true);
    }, [disabled, isRefreshing]);

    const handleTouchMove = useCallback((e) => {
        if (!isPulling || disabled || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;

        if (diff > 0 && window.scrollY <= 0) {
            e.preventDefault();
            const distance = Math.min(diff * 0.5, MAX_PULL);
            setPullDistance(distance);

            // Haptic when crossing threshold
            if (distance >= THRESHOLD && pullDistance < THRESHOLD) {
                hapticMedium();
            }
        }
    }, [isPulling, disabled, isRefreshing, pullDistance]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling) return;

        if (pullDistance >= THRESHOLD && onRefresh) {
            setIsRefreshing(true);
            hapticMedium();

            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
            }
        }

        setIsPulling(false);
        setPullDistance(0);
    }, [isPulling, pullDistance, onRefresh]);

    const rotation = Math.min(pullDistance / THRESHOLD * 360, 360);
    const opacity = Math.min(pullDistance / THRESHOLD, 1);

    return (
        <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative"
            style={{ touchAction: isPulling ? 'none' : 'auto' }}
        >
            {/* Pull indicator */}
            <div
                className="absolute left-1/2 -translate-x-1/2 z-10 transition-all duration-150"
                style={{
                    top: `${Math.max(pullDistance - 40, -40)}px`,
                    opacity: opacity
                }}
            >
                <div
                    className={`w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center shadow-lg ${isRefreshing ? 'animate-spin' : ''}`}
                    style={{ transform: isRefreshing ? '' : `rotate(${rotation}deg)` }}
                >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </div>
            </div>

            {/* Content with pull offset */}
            <div
                className="transition-transform duration-150"
                style={{ transform: `translateY(${isPulling ? pullDistance : 0}px)` }}
            >
                {children}
            </div>
        </div>
    );
}
