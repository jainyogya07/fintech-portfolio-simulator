import { useState, useRef, useEffect } from 'react';
import { getTooltip } from '../config/educationalContent';

export default function Tooltip({ id, children, position = 'top' }) {
    const [isVisible, setIsVisible] = useState(false);
    const [showFull, setShowFull] = useState(false);
    const tooltipRef = useRef(null);
    const triggerRef = useRef(null);

    const content = getTooltip(id);

    if (!content) {
        return children;
    }

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--color-bg-secondary)] border-x-transparent border-b-transparent',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--color-bg-secondary)] border-x-transparent border-t-transparent',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--color-bg-secondary)] border-y-transparent border-r-transparent',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--color-bg-secondary)] border-y-transparent border-l-transparent'
    };

    return (
        <span className="relative inline-flex items-center gap-1" ref={triggerRef}>
            {children}
            <button
                type="button"
                className="inline-flex items-center justify-center w-4 h-4 text-xs rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/30 transition-colors cursor-help"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => {
                    setIsVisible(false);
                    setShowFull(false);
                }}
                onClick={() => setShowFull(!showFull)}
                aria-label={`Learn about ${content.title}`}
            >
                ?
            </button>

            {isVisible && (
                <div
                    ref={tooltipRef}
                    className={`absolute z-50 ${positionClasses[position]} animate-fadeIn`}
                    style={{ width: showFull ? '320px' : '220px' }}
                >
                    <div className="glass-card p-3 text-sm shadow-lg border border-[var(--color-border)]">
                        {/* Arrow */}
                        <div
                            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
                        />

                        {/* Title */}
                        <h4 className="font-semibold text-[var(--color-primary)] mb-1 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {content.title}
                        </h4>

                        {/* Short Description */}
                        <p className="text-[var(--color-text-secondary)] mb-2">
                            {content.short}
                        </p>

                        {/* Full Content */}
                        {showFull && (
                            <div className="border-t border-[var(--color-border)] pt-2 mt-2 space-y-2">
                                <p className="text-[var(--color-text-primary)] whitespace-pre-line text-xs leading-relaxed">
                                    {content.long}
                                </p>
                                {content.example && (
                                    <div className="bg-[var(--color-primary)]/10 rounded p-2 text-xs">
                                        <span className="font-semibold text-[var(--color-primary)]">Example: </span>
                                        {content.example}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Click for more */}
                        {!showFull && (
                            <p className="text-xs text-[var(--color-primary)] opacity-75 mt-1">
                                Click for more details
                            </p>
                        )}
                    </div>
                </div>
            )}
        </span>
    );
}

/**
 * Simple inline tooltip without children wrapper
 */
export function InfoTooltip({ id, size = 'sm' }) {
    const [isVisible, setIsVisible] = useState(false);
    const [showFull, setShowFull] = useState(false);

    const content = getTooltip(id);

    if (!content) return null;

    const sizeClasses = {
        sm: 'w-4 h-4 text-xs',
        md: 'w-5 h-5 text-sm',
        lg: 'w-6 h-6 text-base'
    };

    return (
        <span className="relative inline-flex">
            <button
                type="button"
                className={`inline-flex items-center justify-center ${sizeClasses[size]} rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/30 transition-colors cursor-help`}
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => {
                    setIsVisible(false);
                    setShowFull(false);
                }}
                onClick={() => setShowFull(!showFull)}
                aria-label={`Learn about ${content.title}`}
            >
                ?
            </button>

            {isVisible && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-fadeIn" style={{ width: showFull ? '300px' : '200px' }}>
                    <div className="glass-card p-3 text-sm shadow-lg border border-[var(--color-border)]">
                        <h4 className="font-semibold text-[var(--color-primary)] mb-1">{content.title}</h4>
                        <p className="text-[var(--color-text-secondary)] text-xs">{content.short}</p>

                        {showFull && (
                            <div className="border-t border-[var(--color-border)] pt-2 mt-2">
                                <p className="text-[var(--color-text-primary)] whitespace-pre-line text-xs leading-relaxed">
                                    {content.long}
                                </p>
                            </div>
                        )}

                        {!showFull && (
                            <p className="text-xs text-[var(--color-primary)] opacity-75 mt-1">Click for more</p>
                        )}
                    </div>
                </div>
            )}
        </span>
    );
}
