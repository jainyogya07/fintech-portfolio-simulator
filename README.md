# 📈 Portfolio Simulator

**Professional-Grade Investment Portfolio Analysis & Planning**

[![Tests](https://img.shields.io/badge/tests-95%20passing-brightgreen)](#testing)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](#typescript)
[![PWA](https://img.shields.io/badge/PWA-Installable-purple)](#pwa)

> A comprehensive fintech application for portfolio management, risk analysis, and retirement planning with institutional-quality calculations.

---

## 🌟 Highlights

- **40+ Features** — Portfolio tracking, Monte Carlo, retirement planning, and more
- **Professional Math** — CAGR, Sharpe, Sortino, VaR, CVaR, Max Drawdown
- **95 Tests** — Comprehensive automated testing
- **Mobile-First** — PWA with offline support
- **Type-Safe** — TypeScript definitions included

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test:run

# Build for production
npm run build
```

---

## ✨ Features

### 📊 Portfolio Management
- Add stocks with symbol autocomplete
- Real-time price updates via Alpha Vantage
- Swipeable portfolio table (mobile)
- Export to PDF/CSV
- Multi-currency support (USD, EUR, GBP, etc.)

### 📈 Analytics & Risk
- **Monte Carlo Simulation** — 10,000 paths with fat-tailed distribution
- **Risk Metrics** — VaR, CVaR, Sharpe, Sortino, Max Drawdown
- **Correlation Heatmap** — Visualize asset relationships
- **Crash Simulator** — Test against 2008, COVID, Dot-com

### 🎯 Goals & Planning
- **Retirement Planner** — Smart glide path, Social Security estimates
- **FIRE Calculator** — Financial Independence projections
- **Goal Tracker** — Custom financial goals
- **Rebalancing** — Target allocation recommendations

### 📱 Mobile Experience
- Pull-to-refresh price updates
- Bottom navigation bar
- Swipe actions on holdings
- Haptic feedback
- Installable PWA

---

## 🧮 Calculations

| Metric | Formula |
|--------|---------|
| **CAGR** | `(End/Start)^(1/years) - 1` |
| **Sharpe** | `(Return - Rf) / StdDev` |
| **Sortino** | `(Return - Rf) / DownsideDeviation` |
| **VaR 95%** | `Portfolio × 1.645 × Volatility` |
| **CVaR** | `Mean(losses < VaR)` |
| **Max Drawdown** | `Max(Peak - Trough) / Peak` |

---

## 📁 Project Structure

```
src/
├── components/    # 38 React components
├── services/      # 21 calculation services
├── workers/       # Monte Carlo Web Worker
├── context/       # Portfolio & Theme providers
├── types/         # TypeScript definitions
└── test/          # Integration tests
```

---

## 🧪 Testing

```bash
npm run test:run    # Run once
npm test            # Watch mode
npm run test:coverage  # With coverage
```

**95 tests** across 7 test files covering:
- Core calculations (CAGR, Sharpe, VaR, etc.)
- Retirement projections
- Tax calculations
- Form validation
- Integration flows

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
npx vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### GitHub Pages
```bash
npm run deploy
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| Recharts | Charts |
| mathjs + jstat | Financial Math |
| Vitest | Testing |
| TypeScript | Type Safety |

---

## 📄 License

MIT License — Free for personal and commercial use.

---

## 🙏 Credits

Built with ❤️ for investors who want institutional-quality tools.
