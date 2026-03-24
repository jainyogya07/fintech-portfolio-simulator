import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const THEMES = {
    light: {
        name: 'Light',
        icon: '☀️',
        colors: {
            '--color-bg-primary': '#f4f4f5',
            '--color-bg-secondary': '#ffffff',
            '--color-bg-card': '#ffffff',
            '--color-text-primary': '#09090b',
            '--color-text-secondary': '#71717a',
            '--color-border': '#e4e4e7',
            '--color-border-light': '#f4f4f5',
            '--color-primary': '#4f46e5',
            '--color-primary-light': '#6366f1',
            '--color-primary-dark': '#4338ca',
            '--color-success': '#059669',
            '--color-warning': '#d97706',
            '--color-danger': '#dc2626'
        }
    },
    dark: {
        name: 'Dark',
        icon: '🌙',
        colors: {
            '--color-bg-primary': '#09090b',
            '--color-bg-secondary': '#18181b',
            '--color-bg-card': '#18181b',
            '--color-text-primary': '#fafafa',
            '--color-text-secondary': '#a1a1aa',
            '--color-border': '#27272a',
            '--color-border-light': '#18181b',
            '--color-primary': '#818cf8',
            '--color-primary-light': '#a5b4fc',
            '--color-primary-dark': '#6366f1',
            '--color-success': '#34d399',
            '--color-warning': '#fbbf24',
            '--color-danger': '#f87171'
        }
    },
    midnight: {
        name: 'Midnight',
        icon: '🌌',
        colors: {
            '--color-bg-primary': '#030712',
            '--color-bg-secondary': '#0c111d',
            '--color-bg-card': '#0c111d',
            '--color-text-primary': '#f9fafb',
            '--color-text-secondary': '#9ca3af',
            '--color-border': '#1f2937',
            '--color-border-light': '#111827',
            '--color-primary': '#8b5cf6',
            '--color-primary-light': '#a78bfa',
            '--color-primary-dark': '#7c3aed',
            '--color-success': '#4ade80',
            '--color-warning': '#facc15',
            '--color-danger': '#fb7185'
        }
    },
    ocean: {
        name: 'Ocean',
        icon: '🌊',
        colors: {
            '--color-bg-primary': '#0b1526',
            '--color-bg-secondary': '#111f33',
            '--color-bg-card': '#111f33',
            '--color-text-primary': '#f1f5f9',
            '--color-text-secondary': '#94a3b8',
            '--color-border': '#1e3a5f',
            '--color-border-light': '#142841',
            '--color-primary': '#38bdf8',
            '--color-primary-light': '#7dd3fc',
            '--color-primary-dark': '#0ea5e9',
            '--color-success': '#4ade80',
            '--color-warning': '#fb923c',
            '--color-danger': '#fb7185'
        }
    }
};

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('portfolio-theme');
        return saved || 'dark';
    });

    useEffect(() => {
        const themeConfig = THEMES[theme] || THEMES.dark;
        const root = document.documentElement;

        Object.entries(themeConfig.colors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        localStorage.setItem('portfolio-theme', theme);

        // Set meta theme-color for mobile
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', themeConfig.colors['--color-bg-primary']);
        }
    }, [theme]);

    const value = {
        theme,
        setTheme,
        themes: THEMES,
        currentTheme: THEMES[theme]
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}

export { THEMES };
