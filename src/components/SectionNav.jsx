import { useState, useEffect } from 'react';

const SECTIONS = [
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'risk', label: 'Risk' },
    { id: 'scenarios', label: 'Scenarios' },
    { id: 'insights', label: 'Insights' },
    { id: 'planning', label: 'Planning' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'ai', label: 'Models' },
    { id: 'global', label: 'Global' }
];

export default function SectionNav() {
    const [activeSection, setActiveSection] = useState('portfolio');

    useEffect(() => {
        const handleScroll = () => {
            const sections = SECTIONS.map(s => ({
                id: s.id,
                element: document.getElementById(s.id)
            })).filter(s => s.element);

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
            const offset = 96;
            const y = element.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <nav
            className="sticky top-[61px] z-40 hidden border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--color-bg-primary)]/80 sm:top-[69px] sm:block"
            aria-label="Section navigation"
        >
            <div className="page-shell px-4 sm:px-6">
                <div className="scrollbar-hide flex items-stretch gap-0 overflow-x-auto">
                    {SECTIONS.map(section => {
                        const active = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => scrollToSection(section.id)}
                                className={`relative shrink-0 border-b-2 px-3 py-3 text-xs font-medium transition-colors sm:px-4 sm:text-[0.8125rem] ${active
                                    ? 'border-[var(--color-primary)] text-[var(--color-text-primary)]'
                                    : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                                    }`}
                            >
                                {section.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}

export { SECTIONS };
