import { useTheme, THEMES } from '../context/ThemeContext';
import { useState } from 'react';

export default function ThemeToggle() {
    const { theme, setTheme, themes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn-icon flex items-center gap-2 px-3 py-2"
                title="Change theme"
            >
                <span className="text-lg">{themes[theme]?.icon || '🌙'}</span>
                <span className="hidden sm:inline text-sm">{themes[theme]?.name}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg shadow-lg z-50 animate-fadeIn overflow-hidden">
                        <div className="p-2 border-b border-[var(--color-border)]">
                            <p className="text-xs font-semibold text-[var(--color-text-secondary)] px-2">
                                Choose Theme
                            </p>
                        </div>
                        <div className="p-1">
                            {Object.entries(themes).map(([key, themeConfig]) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setTheme(key);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-3 py-2 text-left rounded flex items-center gap-3 transition-colors ${theme === key
                                            ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                                            : 'hover:bg-[var(--color-bg-primary)]'
                                        }`}
                                >
                                    <span className="text-lg">{themeConfig.icon}</span>
                                    <span className="font-medium">{themeConfig.name}</span>
                                    {theme === key && (
                                        <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
