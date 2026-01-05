import { useState } from 'react';
import { API_VERSION, API_BASE_URL, API_ENDPOINTS, PRICING_TIERS, CODE_EXAMPLES } from '../config/apiDocumentation';

export default function APIDocsPanel() {
    const [activeCategory, setActiveCategory] = useState(0);
    const [codeLanguage, setCodeLanguage] = useState('javascript');
    const [expandedEndpoint, setExpandedEndpoint] = useState(null);

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <span className="text-2xl">🔌</span>
                        Developer API
                    </h2>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                        v{API_VERSION} • REST API for portfolio calculations
                    </p>
                </div>
                <a
                    href="#"
                    className="text-sm text-[var(--color-primary)] hover:underline"
                >
                    Get API Key →
                </a>
            </div>

            {/* Base URL */}
            <div className="mb-6 p-3 bg-[var(--color-bg-secondary)] rounded-lg font-mono text-sm">
                <span className="text-[var(--color-text-secondary)]">Base URL: </span>
                <span className="text-[var(--color-primary)]">{API_BASE_URL}</span>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {API_ENDPOINTS.map((cat, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveCategory(index)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${activeCategory === index
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)]'
                            }`}
                    >
                        {cat.category}
                    </button>
                ))}
            </div>

            {/* Endpoints */}
            <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                {API_ENDPOINTS[activeCategory]?.endpoints.map((endpoint, index) => (
                    <div
                        key={index}
                        className="bg-[var(--color-bg-secondary)] rounded-lg overflow-hidden"
                    >
                        <button
                            onClick={() => setExpandedEndpoint(expandedEndpoint === index ? null : index)}
                            className="w-full p-3 flex items-center justify-between text-left hover:bg-[var(--color-border)] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-0.5 text-xs font-bold rounded ${endpoint.method === 'GET' ? 'bg-[var(--color-success)] text-white' :
                                        endpoint.method === 'POST' ? 'bg-[var(--color-primary)] text-white' :
                                            'bg-[var(--color-warning)] text-white'
                                    }`}>
                                    {endpoint.method}
                                </span>
                                <span className="font-mono text-sm">{endpoint.path}</span>
                            </div>
                            <svg className={`w-4 h-4 transition-transform ${expandedEndpoint === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {expandedEndpoint === index && (
                            <div className="p-4 border-t border-[var(--color-border)] animate-fadeIn">
                                <p className="text-sm mb-3">{endpoint.description}</p>

                                {/* Parameters */}
                                <div className="mb-3">
                                    <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Parameters:</p>
                                    <div className="space-y-1">
                                        {endpoint.parameters.map((param, pIndex) => (
                                            <div key={pIndex} className="flex items-start gap-2 text-xs">
                                                <code className="text-[var(--color-primary)]">{param.name}</code>
                                                <span className="text-[var(--color-text-secondary)]">({param.type})</span>
                                                {param.required && <span className="text-[var(--color-danger)]">required</span>}
                                                <span className="text-[var(--color-text-secondary)]">- {param.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Response */}
                                <div className="mb-2">
                                    <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Response:</p>
                                    <pre className="bg-[var(--color-bg-primary)] p-2 rounded text-xs overflow-x-auto">
                                        {JSON.stringify(endpoint.response, null, 2)}
                                    </pre>
                                </div>

                                <p className="text-xs text-[var(--color-text-secondary)]">
                                    Rate limit: {endpoint.rateLimit}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Code Examples */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">Code Example</h3>
                    <div className="flex gap-1">
                        {['javascript', 'python', 'curl'].map(lang => (
                            <button
                                key={lang}
                                onClick={() => setCodeLanguage(lang)}
                                className={`px-2 py-1 text-xs rounded ${codeLanguage === lang
                                        ? 'bg-[var(--color-primary)] text-white'
                                        : 'bg-[var(--color-bg-secondary)]'
                                    }`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>
                <pre className="bg-[var(--color-bg-secondary)] p-4 rounded-lg text-xs overflow-x-auto font-mono">
                    {CODE_EXAMPLES[codeLanguage]}
                </pre>
            </div>

            {/* Pricing */}
            <div>
                <h3 className="font-semibold text-sm mb-2">Pricing Tiers</h3>
                <div className="grid grid-cols-3 gap-2">
                    {PRICING_TIERS.map((tier, index) => (
                        <div
                            key={index}
                            className={`p-3 rounded-lg text-center ${index === 1 ? 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]' : 'bg-[var(--color-bg-secondary)]'
                                }`}
                        >
                            <p className="font-bold">{tier.name}</p>
                            <p className="text-lg font-bold text-[var(--color-primary)]">{tier.price}</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">{tier.limits}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Demo Note */}
            <div className="mt-4 p-3 bg-[var(--color-warning)]/10 rounded-lg text-xs">
                <strong>📌 Note:</strong> This is a demo API documentation.
                The actual API endpoints are not yet deployed. Use the app's
                built-in services directly for now.
            </div>
        </div>
    );
}
