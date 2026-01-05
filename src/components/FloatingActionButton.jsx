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
                        onClick={() => handleAction(scrollToTop)}
                        className="flex items-center gap-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] px-3 py-2 rounded-full shadow-lg"
                    >
                        <span className="text-sm">📈 Add Stock</span>
                    </button>
                    <button
                        onClick={() => handleAction(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }))}
                        className="flex items-center gap-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] px-3 py-2 rounded-full shadow-lg"
                    >
                        <span className="text-sm">🎤 Voice</span>
                    </button>
                </div>
            )}

            {/* Main FAB */}
            <button
                onClick={toggleMenu}
                className={`w-12 h-12 rounded-full bg-[var(--color-primary)] text-white shadow-lg flex items-center justify-center transition-transform ${isOpen ? 'rotate-45' : ''}`}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </button>
        </div>
    );
}
