import { useState, useEffect } from 'react';

const NAV_ITEMS = [
    { id: 'portfolio', label: 'Portfolio', icon: '📊', sections: ['portfolio'] },
    { id: 'analytics', label: 'Analytics', icon: '📈', sections: ['risk', 'insights'] },
    { id: 'goals', label: 'Goals', icon: '🎯', sections: ['scenarios', 'planning'] },
    { id: 'more', label: 'More', icon: '🔗', sections: ['integrations', 'ai', 'global'] }
];

export default function BottomNav() {
    const [activeTab, setActiveTab] = useState('portfolio');

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY + 200;

            for (const item of NAV_ITEMS.slice().reverse()) {
                for (const sectionId of item.sections) {
                    const element = document.getElementById(sectionId);
                    if (element && element.offsetTop <= scrollY) {
                        setActiveTab(item.id);
                        return;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (item) => {
        setActiveTab(item.id);
        const sectionId = item.sections[0];
        const element = document.getElementById(sectionId);
        if (element) {
            const y = element.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-bg-primary)]/95 backdrop-blur-xl border-t border-[var(--color-border)] sm:hidden safe-area-pb">
            <div className="flex items-center justify-around py-2 pb-safe">
                {NAV_ITEMS.map(item => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => scrollToSection(item)}
                        className={`relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 transition-colors ${activeTab === item.id
                                ? 'text-[var(--color-primary)]'
                                : 'text-[var(--color-text-secondary)]'
                            }`}
                    >
                        <span className="text-lg leading-none">{item.icon}</span>
                        <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
                        {activeTab === item.id ? (
                            <span className="absolute bottom-1 h-0.5 w-6 rounded-full bg-[var(--color-primary)]" />
                        ) : null}
                    </button>
                ))}
            </div>
        </nav>
    );
}
