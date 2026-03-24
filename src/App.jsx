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
import SectionHeader from './components/SectionHeader';
import './index.css';

function Header() {
  const { refreshPrices, isRefreshing, lastUpdated } = usePortfolio();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/90 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--color-bg-primary)]/75">
      <div className="page-shell flex items-center justify-between gap-4 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-primary)] shadow-[var(--shadow-surface)]"
            aria-hidden
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 16l4-4 4 4 6-7" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[0.9375rem] font-semibold tracking-tight text-[var(--color-text-primary)]">
              Portfolio Simulator
            </h1>
            <p className="truncate text-xs text-[var(--color-text-secondary)]">Live holdings · risk · scenarios</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {lastUpdated ? (
            <span className="hidden text-xs tabular-nums text-[var(--color-text-secondary)] sm:inline">
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : null}
          <ThemeToggle />
          <ExportButton />
          <button
            type="button"
            onClick={refreshPrices}
            disabled={isRefreshing}
            className="btn-icon flex items-center gap-2 px-3 py-2"
          >
            <svg
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline text-sm font-medium">Sync</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function Dashboard() {
  const { refreshPrices } = usePortfolio();

  return (
    <PullToRefresh onRefresh={refreshPrices}>
      <main className="page-shell px-4 sm:px-6 py-8 sm:py-10">
        <MobilePortfolioHeader />

        {/* —— Primary workbench — dense left rail + wide canvas —— */}
        <section id="portfolio" className="scroll-mt-28 mb-16 sm:mb-20 lg:mb-24">
          <SectionHeader
            kicker="Workbench"
            title="Portfolio"
            description="Add positions, review exposure, then drill into risk and scenarios below."
          />
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="space-y-6 lg:col-span-4 lg:sticky lg:top-28">
              <AddAssetForm />
              <SummaryCard />
              <RiskMeter />
            </div>
            <div className="space-y-6 lg:col-span-8">
              <PortfolioTable />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-7">
                  <AllocationChart />
                </div>
                <div className="md:col-span-5">
                  <VaRDisplay />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* —— Risk: hero module + supporting metrics —— */}
        <section className="mb-16 space-y-10 sm:mb-20 lg:mb-24 lg:space-y-12">
          <div id="risk" className="scroll-mt-28">
            <SectionHeader
              kicker="Risk engine"
              title="Stress, variance, and correlation"
              description="Simulation-led view of how this portfolio behaves under uncertainty and drawdowns."
            />
            <div className="space-y-6 lg:space-y-8">
              <MonteCarloSimulator />
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <RiskMetrics />
                </div>
                <div className="lg:col-span-7">
                  <CorrelationHeatmap />
                </div>
              </div>
              <DrawdownChart />
            </div>
          </div>
        </section>

        {/* —— Scenarios: narrative tools — full width + paired panels —— */}
        <section id="scenarios" className="scroll-mt-28 mb-16 space-y-6 sm:mb-20 lg:mb-24 lg:space-y-8">
          <SectionHeader
            kicker="Scenarios"
            title="Goals and tail events"
            description="Model shocks alongside retirement and goal progress without crowding the primary table."
          />
          <CrashSimulator />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <RetirementPlanner />
            <GoalTracker />
          </div>
        </section>

        {/* —— Insights & planning: split runway on large screens —— */}
        <div className="mb-16 grid grid-cols-1 gap-10 sm:mb-20 lg:mb-24 xl:grid-cols-2 xl:gap-12">
          <section id="insights" className="scroll-mt-28 space-y-6">
            <SectionHeader kicker="Optimize" title="Insights" description="Tax-aware hints and allocation nudges." />
            <div className="space-y-6">
              <OptimizationPanel />
              <TaxHints />
            </div>
          </section>
          <section id="planning" className="scroll-mt-28 space-y-6">
            <SectionHeader kicker="Horizon" title="Planning" description="Backtests, FIRE, dividends, and rebalance math." />
            <div className="space-y-6">
              <BacktestPanel />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FIRECalculator />
                <RebalancingCalculator />
              </div>
              <DividendTracker />
            </div>
          </section>
        </div>

        <section id="integrations" className="scroll-mt-28 mb-16 space-y-6 sm:mb-20 lg:mb-24 lg:space-y-8">
          <SectionHeader
            kicker="Operations"
            title="Alerts and brokers"
            description="Connect data sources and keep the book within your guardrails."
          />
          <ScenarioBuilder />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <AlertCenter />
            <BrokerConnect />
          </div>
        </section>

        <section id="ai" className="scroll-mt-28 mb-16 space-y-6 sm:mb-20 lg:mb-24">
          <SectionHeader
            kicker="Models & API"
            title="Predictions and developer access"
            description="Forward-looking views and structured exports for your own tooling."
          />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <PredictionPanel />
            <APIDocsPanel />
          </div>
        </section>

        <section id="global" className="scroll-mt-28 space-y-6 lg:space-y-8">
          <SectionHeader
            kicker="Global"
            title="Currency, real assets, voice"
            description="Cross-border assumptions and optional hands-free controls."
          />
          <RealEstateTracker />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <CurrencySettings />
            <VoiceAssistant />
          </div>
        </section>
      </main>
    </PullToRefresh>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)]">
      <div className="page-shell flex flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
        <p className="max-w-md text-sm text-[var(--color-text-secondary)]">
          Portfolio Simulator — institutional-style analytics in the browser. Not investment advice.
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">Market data may be delayed.</p>
      </div>
    </footer>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PortfolioProvider>
          <div className="flex min-h-screen flex-col pb-16 sm:pb-0">
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
