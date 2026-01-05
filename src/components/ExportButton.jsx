import { usePortfolio } from '../context/PortfolioContext';
import { downloadReport, printReport } from '../services/reportGenerator';
import { calculatePortfolioVolatility } from '../services/calculations';

export default function ExportButton() {
    const { holdings, totalValue, totalCost, totalGain, returnPercent } = usePortfolio();

    const handleExport = (type) => {
        if (holdings.length === 0) {
            alert('Add holdings to generate a report');
            return;
        }

        const portfolioData = {
            holdings,
            totalValue,
            totalCost,
            totalGain,
            gainPercent: returnPercent,
            riskMetrics: {
                volatility: calculatePortfolioVolatility(holdings),
                // Add more metrics as available
            }
        };

        if (type === 'download') {
            downloadReport(portfolioData);
        } else if (type === 'print') {
            printReport(portfolioData);
        }
    };

    return (
        <div className="relative group">
            <button
                className="btn-icon flex items-center gap-2 px-3 py-2"
                onClick={() => handleExport('download')}
                title="Export Report"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Export</span>
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-1 w-40 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button
                    onClick={() => handleExport('download')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-bg-primary)] rounded-t-lg flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download HTML
                </button>
                <button
                    onClick={() => handleExport('print')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-bg-primary)] rounded-b-lg flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Report
                </button>
            </div>
        </div>
    );
}
