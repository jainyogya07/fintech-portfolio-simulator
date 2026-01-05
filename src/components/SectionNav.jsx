import { useState, useEffect } from 'react';

const SECTIONS = [
    { id: 'portfolio', label: 'Portfolio', icon: '📊' },
    { id: 'risk', label: 'Risk', icon: '📈' },
    { id: 'scenarios', label: 'Scenarios', icon: '🎯' },
    { id: 'insights', label: 'Insights', icon: '💡' },
    { id: 'planning', label: 'Planning', icon: '🔥' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'ai', label: 'AI', icon: '🧠' },
    { id: 'global', label: 'Global', icon: '🌍' }
];

export default function SectionNav() {
    const [activeSection, setActiveSection] = useState('portfolio');

    useEffect(() => {
        const handleScroll = () => {
            const sections = SECTIONS.map(s => ({
                id: s.id,
                element: document.getElementById(s.id)
            })).filter(s => s.element);

            // Find which section is most visible
            let current = 'portfolio';
            for (const section of sections) {
                const rect = section.element.getBoundingClientRect();
                if (rect.top <= 150) {
                    current = section.id;
                }
            }
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 100; // Account for sticky header
            const y = element.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <nav className="hidden sm:block sticky top-[73px] z-40 bg-[var(--color-bg-primary)]/95 backdrop-blur-md border-b border-[var(--color-border)]">
            <div className="max-w-7xl mx-auto px-2 sm:px-6">
                <div className="flex items-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 overflow-x-auto scrollbar-hide">
                    {SECTIONS.map(section => (
                        <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className={`flex items-center justify-center gap-1 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all min-w-[36px] ${activeSection === section.id
                                ? 'bg-[var(--color-primary)] text-white shadow-md'
                                : 'hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] active:bg-[var(--color-bg-secondary)]'
                                }`}
                        >
                            <span className="text-base sm:text-sm">{section.icon}</span>
                            <span className="hidden sm:inline">{section.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
}

export { SECTIONS };
