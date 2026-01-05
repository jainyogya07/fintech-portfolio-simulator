# 📚 Portfolio Simulator - User Guide

## Getting Started

### Step 1: Add Your First Stock
1. Find the **"Add Stock"** form
2. Enter stock symbol (e.g., `AAPL`, `TSLA`)
3. Enter number of shares
4. Enter purchase price
5. Click **"Add to Portfolio"**

> 💡 Use Quick Add buttons for popular stocks!

---

### Step 2: View Your Portfolio
- **Portfolio Summary** — Total value, gain/loss
- **Holdings Table** — All your stocks
- **Allocation Chart** — Pie chart breakdown
- **Risk Meter** — Portfolio risk level

---

### Step 3: Run Simulations

**Monte Carlo:**
1. Go to **Analytics** section
2. Select years (1-30)
3. Click **"Run Simulation"**
4. View probability ranges

**Understanding Results:**
- Purple band = 50% likely outcomes
- Outer band = 80% possible outcomes
- Line = Median (most likely)

---

## Feature Guides

### 📊 Analytics Section

| Tool | What It Does |
|------|--------------|
| **Monte Carlo** | 10,000 future simulations |
| **Risk Metrics** | VaR, Sharpe, Sortino |
| **Correlation** | Asset relationships |
| **Drawdown** | Historical losses |

### 🎯 Goals Section

| Tool | What It Does |
|------|--------------|
| **Retirement Planner** | Are you on track? |
| **FIRE Calculator** | Financial Independence |
| **Goal Tracker** | Custom goals |
| **Rebalancing** | Allocation targets |

### 🔧 More Section

| Tool | What It Does |
|------|--------------|
| **Crash Simulator** | Stress tests (2008, COVID) |
| **Tax Hints** | Wash sales, harvesting |
| **Currency** | Multi-currency view |
| **Voice** | Ask questions |

---

## Mobile Tips

### Pull to Refresh
Drag down from top to refresh prices.

### Swipe Actions
- **Swipe left** → Delete stock
- **Swipe right** → View details

### Bottom Navigation
4 tabs: Portfolio, Analytics, Goals, More

### Install as App
1. Open in Chrome/Safari
2. Tap "Add to Home Screen"
3. Use like native app!

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `R` | Refresh prices |
| `T` | Toggle theme |

---

## Understanding Metrics

### Risk Metrics
| Metric | Good | Moderate | High |
|--------|------|----------|------|
| **Volatility** | <10% | 10-20% | >20% |
| **Sharpe** | >1.0 | 0.5-1.0 | <0.5 |
| **Max Drawdown** | <15% | 15-30% | >30% |

### Performance Metrics
| Metric | Meaning |
|--------|---------|
| **CAGR** | True annualized return |
| **Sortino** | Like Sharpe, but only penalizes downside |
| **Calmar** | Return per unit of drawdown |

---

## FAQ

**Q: Where is my data stored?**
A: Locally in your browser. Nothing sent to servers.

**Q: How accurate are simulations?**
A: Uses institutional models, but past ≠ future.

**Q: Can I use offline?**
A: Yes! Install as PWA for offline access.

---

## Glossary

| Term | Definition |
|------|------------|
| **CAGR** | Compound Annual Growth Rate |
| **VaR** | Value at Risk (potential loss) |
| **CVaR** | Average loss when VaR is breached |
| **Sharpe** | Risk-adjusted return |
| **Sortino** | Sharpe but only downside |
| **Beta** | Market sensitivity |
| **Alpha** | Excess returns |
| **Drawdown** | Peak-to-trough decline |
| **FIRE** | Financial Independence, Retire Early |
