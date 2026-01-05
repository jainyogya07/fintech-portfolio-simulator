import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import AddAssetForm from './components/AddAssetForm';
import PortfolioTable from './components/PortfolioTable';
import SummaryCard from './components/SummaryCard';
import AllocationChart from './components/AllocationChart';
import RiskMeter from './components/RiskMeter';
import MonteCarloSimulator from './components/MonteCarloSimulator';
import VaRDisplay from './components/VaRDisplay';
import RiskMetrics from './components/RiskMetrics';
import CorrelationHeatmap from './components/CorrelationHeatmap';
import DrawdownChart from './components/DrawdownChart';
import CrashSimulator from './components/CrashSimulator';
import RetirementPlanner from './components/RetirementPlanner';
import GoalTracker from './components/GoalTracker';
import ExportButton from './components/ExportButton';
import OptimizationPanel from './components/OptimizationPanel';
import TaxHints from './components/TaxHints';
import BacktestPanel from './components/BacktestPanel';
import FIRECalculator from './components/FIRECalculator';
import RebalancingCalculator from './components/RebalancingCalculator';
import DividendTracker from './components/DividendTracker';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import AlertCenter from './components/AlertCenter';
import ScenarioBuilder from './components/ScenarioBuilder';
import BrokerConnect from './components/BrokerConnect';
import PredictionPanel from './components/PredictionPanel';
import APIDocsPanel from './components/APIDocsPanel';
import CurrencySettings from './components/CurrencySettings';
import RealEstateTracker from './components/RealEstateTracker';
import VoiceAssistant from './components/VoiceAssistant';
import SectionNav from './components/SectionNav';
import BottomNav from './components/BottomNav';
import PullToRefresh from './components/PullToRefresh';
import MobilePortfolioHeader from './components/MobilePortfolioHeader';
import FloatingActionButton from './components/FloatingActionButton';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

function Header() {
  const { refreshPrices, isRefreshing, lastUpdated } = usePortfolio();

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[#a855f7] flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Portfolio Simulator</h1>
              <p className="text-xs text-[var(--color-text-secondary)]">Professional Financial Planning</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-[var(--color-text-secondary)] hidden sm:block mr-2">
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <ThemeToggle />
            <ExportButton />
            <button
              onClick={refreshPrices}
              disabled={isRefreshing}
              className="btn-icon flex items-center gap-2 px-3 py-2"
            >
              <svg
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function Dashboard() {
  const { refreshPrices } = usePortfolio();

  return (
    <PullToRefresh onRefresh={refreshPrices}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Mobile Portfolio Summary */}
        <MobilePortfolioHeader />

        {/* Portfolio Overview Section */}
        <div id="portfolio" className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mb-6 sm:mb-8 scroll-mt-28">
          {/* Left Column - Input & Summary */}
          <div className="lg:col-span-4 space-y-6">
            <AddAssetForm />
            <SummaryCard />
            <RiskMeter />
          </div>

          {/* Right Column - Table & Charts */}
          <div className="lg:col-span-8 space-y-6">
            <PortfolioTable />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AllocationChart />
              <VaRDisplay />
            </div>
          </div>
        </div>

        {/* Phase 2: Advanced Risk Analysis Section */}
        <div id="risk" className="space-y-6 mb-8 scroll-mt-28">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent"></div>
            <h2 className="text-lg font-semibold text-[var(--color-text-secondary)]">Advanced Risk Analysis</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent"></div>
          </div>

          {/* Monte Carlo - Full Width */}
          <MonteCarloSimulator />

          {/* Risk Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskMetrics />
            <CorrelationHeatmap />
          </div>

          {/* Historical Drawdown - Full Width */}
          <DrawdownChart />
        </div>

        {/* Phase 3: Scenario Planning & Goals */}
        <div id="scenarios" className="space-y-6 mb-8 scroll-mt-28">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent"></div>
            <h2 className="text-lg font-semibold text-[var(--color-text-secondary)]">Scenario Planning & Goals</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent"></div>
          </div>

          {/* Crash Simulator - Full Width */}
          <CrashSimulator />

          {/* Retirement & Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RetirementPlanner />
            <GoalTracker />
          </div>
        </div>

        {/* Phase 4: Insights & Optimization */}
        <div id="insights" className="space-y-6 scroll-mt-28">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent"></div>
            <h2 className="text-lg font-semibold text-[var(--color-text-secondary)]">Insights & Optimization</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OptimizationPanel />
            <TaxHints />
          </div>
        </div>

        {/* Phase 5: Advanced Planning */}
        <div id="planning" className="space-y-6 scroll-mt-28">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent"></div>
            <h2 className="text-lg font-semibold text-[var(--color-text-secondary)]">Advanced Planning</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent"></div>
          </div>

          {/* Backtesting - Full Width */}
          <BacktestPanel />

          {/* FIRE & Rebalancing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FIRECalculator />
            <RebalancingCalculator />
          </div>

          {/* Dividends */}
          <DividendTracker />
        </div>

        {/* Phase 6: Alerts & Integrations */}
        <div id="integrations" className="space-y-6 scroll-mt-28">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent"></div>
            <h2 className="text-lg font-semibold text-[var(--color-text-secondary)]">Alerts & Integrations</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent"></div>
          </div>

          {/* Custom Scenario - Full Width */}
          <ScenarioBuilder />

          {/* Alerts & Broker */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AlertCenter />
            <BrokerConnect />
          </div>
        </div>

        {/* Phase 7: ML & Developer */}
        <div id="ai" className="space-y-6 scroll-mt-28">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent"></div>
            <h2 className="text-lg font-semibold text-[var(--color-text-secondary)]">AI & Developer Tools</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent"></div>
          </div>

          {/* ML Predictions & API */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PredictionPanel />
            <APIDocsPanel />
          </div>
        </div>

        {/* Phase 8: Global & Voice */}
        <div id="global" className="space-y-6 scroll-mt-28">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent"></div>
            <h2 className="text-lg font-semibold text-[var(--color-text-secondary)]">Global & Voice</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent"></div>
          </div>

          {/* Real Estate - Full Width */}
          <RealEstateTracker />

          {/* Currency & Voice */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CurrencySettings />
            <VoiceAssistant />
          </div>
        </div>
      </main>
    </PullToRefresh>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Portfolio Simulator — Professional-level financial planning at zero cost
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] opacity-75">
            Market data may be delayed. For educational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PortfolioProvider>
          <div className="min-h-screen flex flex-col pb-16 sm:pb-0">
            <Header />
            <SectionNav />
            <Dashboard />
            <Footer />
            <BottomNav />
            <FloatingActionButton />
          </div>
        </PortfolioProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
