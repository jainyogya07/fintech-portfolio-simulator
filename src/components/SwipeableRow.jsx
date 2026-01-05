import { useState, useRef, useCallback } from 'react';
import { hapticLight, hapticMedium } from '../utils/haptics';

/**
 * SwipeableRow component
 * Enables swipe gestures to reveal action buttons
 */
export default function SwipeableRow({
    children,
    onDelete,
    onAction,
    actionIcon = '📊',
    actionLabel = 'View',
    deleteLabel = 'Delete',
    disabled = false
}) {
    const [translateX, setTranslateX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startX = useRef(0);
    const currentX = useRef(0);

    const ACTION_WIDTH = 80;
    const DELETE_WIDTH = 80;
    const SNAP_THRESHOLD = 40;

    const handleTouchStart = useCallback((e) => {
        if (disabled) return;
        startX.current = e.touches[0].clientX;
        currentX.current = translateX;
        setIsDragging(true);
    }, [disabled, translateX]);

    const handleTouchMove = useCallback((e) => {
        if (!isDragging || disabled) return;

        const diff = e.touches[0].clientX - startX.current;
        let newTranslateX = currentX.current + diff;

        // Constrain movement
        newTranslateX = Math.max(-DELETE_WIDTH, Math.min(ACTION_WIDTH, newTranslateX));

        setTranslateX(newTranslateX);
    }, [isDragging, disabled]);

    const handleTouchEnd = useCallback(() => {
        if (!isDragging) return;
        setIsDragging(false);

        // Snap to action or close
        if (translateX > SNAP_THRESHOLD) {
            setTranslateX(ACTION_WIDTH);
            hapticLight();
        } else if (translateX < -SNAP_THRESHOLD) {
            setTranslateX(-DELETE_WIDTH);
            hapticLight();
        } else {
            setTranslateX(0);
        }
    }, [isDragging, translateX]);

    const handleAction = () => {
        hapticMedium();
        setTranslateX(0);
        onAction?.();
    };

    const handleDelete = () => {
        hapticMedium();
        setTranslateX(0);
        onDelete?.();
    };

    const close = () => {
        setTranslateX(0);
    };

    return (
        <div className="relative overflow-hidden">
            {/* Left action (swipe right reveals) */}
            <div
                className="absolute left-0 top-0 bottom-0 flex items-center justify-center bg-[var(--color-primary)]"
                style={{ width: ACTION_WIDTH }}
            >
                <button
                    onClick={handleAction}
                    className="flex flex-col items-center text-white text-xs"
                >
                    <span className="text-lg">{actionIcon}</span>
                    <span>{actionLabel}</span>
                </button>
            </div>

            {/* Right action (swipe left reveals) */}
            <div
                className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-[var(--color-danger)]"
                style={{ width: DELETE_WIDTH }}
            >
                <button
                    onClick={handleDelete}
                    className="flex flex-col items-center text-white text-xs"
                >
                    <span className="text-lg">🗑️</span>
                    <span>{deleteLabel}</span>
                </button>
            </div>

            {/* Main content */}
            <div
                className={`relative bg-[var(--color-bg-secondary)] ${isDragging ? '' : 'transition-transform duration-200'}`}
                style={{ transform: `translateX(${translateX}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={translateX !== 0 ? close : undefined}
            >
                {children}
            </div>
        </div>
    );
}
