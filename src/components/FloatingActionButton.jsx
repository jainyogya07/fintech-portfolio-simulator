import { useState } from 'react';
import { hapticMedium } from '../utils/haptics';

/**
 * Floating Action Button with expandable quick actions
 */
export default function FloatingActionButton({ onAddStock, onSettings }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        hapticMedium();
        setIsOpen(!isOpen);
    };

    const handleAction = (action) => {
        hapticMedium();
        setIsOpen(false);
        action?.();
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="fixed bottom-20 right-4 z-40 sm:hidden">
            {/* Action buttons */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 flex flex-col gap-2 animate-fadeIn">
                    <button
                        type="button"
                        onClick={() => handleAction(scrollToTop)}
                        className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] shadow-md"
                    >
                        Jump to add
                    </button>
                    <button
                        type="button"
                        onClick={() => handleAction(() => document.getElementById('global')?.scrollIntoView({ behavior: 'smooth' }))}
                        className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] shadow-md"
                    >
                        Voice controls
                    </button>
                </div>
            )}

            {/* Main FAB */}
            <button
                type="button"
                onClick={toggleMenu}
                className={`flex h-12 w-12 items-center justify-center rounded-md bg-[var(--color-primary)] text-white shadow-md transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary-light)] ${isOpen ? 'rotate-45' : ''}`}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </button>
        </div>
    );
}
