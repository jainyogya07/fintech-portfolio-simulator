import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const THEMES = {
    light: {
        name: 'Light',
        icon: '☀️',
        colors: {
            '--color-bg-primary': '#f8fafc',
            '--color-bg-secondary': '#ffffff',
            '--color-bg-card': 'rgba(255, 255, 255, 0.9)',
            '--color-text-primary': '#1a1a2e',
            '--color-text-secondary': '#64748b',
            '--color-border': '#e2e8f0',
            '--color-border-light': '#f1f5f9',
            '--color-primary': '#6366f1',
            '--color-success': '#10b981',
            '--color-warning': '#f59e0b',
            '--color-danger': '#ef4444'
        }
    },
    dark: {
        name: 'Dark',
        icon: '🌙',
        colors: {
            '--color-bg-primary': '#0f0f1a',
            '--color-bg-secondary': '#1a1a2e',
            '--color-bg-card': 'rgba(30, 41, 59, 0.8)',
            '--color-text-primary': '#f8fafc',
            '--color-text-secondary': '#94a3b8',
            '--color-border': '#2d2d44',
            '--color-border-light': '#1e1e32',
            '--color-primary': '#818cf8',
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
            '--color-bg-secondary': '#111827',
            '--color-bg-card': 'rgba(17, 24, 39, 0.8)',
            '--color-text-primary': '#f9fafb',
            '--color-text-secondary': '#9ca3af',
            '--color-border': '#1f2937',
            '--color-border-light': '#0f172a',
            '--color-primary': '#a78bfa',
            '--color-success': '#4ade80',
            '--color-warning': '#facc15',
            '--color-danger': '#fb7185'
        }
    },
    ocean: {
        name: 'Ocean',
        icon: '🌊',
        colors: {
            '--color-bg-primary': '#0c1929',
            '--color-bg-secondary': '#132f4c',
            '--color-bg-card': 'rgba(19, 47, 76, 0.8)',
            '--color-text-primary': '#e3f2fd',
            '--color-text-secondary': '#90caf9',
            '--color-border': '#1e4976',
            '--color-border-light': '#173a5e',
            '--color-primary': '#29b6f6',
            '--color-success': '#66bb6a',
            '--color-warning': '#ffa726',
            '--color-danger': '#ef5350'
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
