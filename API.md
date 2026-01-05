# 🔧 API & Technical Reference

## Services

### calculations.js
Core financial calculations.

```javascript
import {
  calculateCAGR,
  calculateSharpeRatio,
  calculateSortinoRatio,
  calculateVaR,
  calculateCVaR,
  calculateMaxDrawdown,
  calculateBeta,
  calculateAlpha,
  generatePortfolioAnalytics
} from './services/calculations';
```

| Function | Returns |
|----------|---------|
| `calculateCAGR(start, end, years)` | CAGR % |
| `calculateSharpeRatio(returns, rf)` | Sharpe ratio |
| `calculateSortinoRatio(returns, rf)` | Sortino ratio |
| `calculateVaR(value, volatility)` | VaR amount |
| `calculateCVaR(value, returns)` | { var95, cvar95 } |
| `calculateMaxDrawdown(values)` | { maxDrawdown, peak, trough } |

---

### monteCarloService.js
Monte Carlo simulations via Web Worker.

```javascript
import { runMonteCarloSimulation } from './services/monteCarloService';

const result = await runMonteCarloSimulation({
  portfolioValue: 10000,
  volatility: 20,
  years: 10,
  numSimulations: 10000
});
```

**Result:**
```javascript
{
  chartData: [...],      // Percentiles per year
  statistics: { mean, median, min, max },
  probabilities: [...],  // Threshold probabilities
  extremeStats: { crashProbability, boomProbability }
}
```

---

### retirementCalculator.js
Retirement projections with glide path.

```javascript
import { calculateRetirement } from './services/retirementCalculator';

const result = calculateRetirement({
  currentAge: 30,
  retirementAge: 65,
  currentSavings: 50000,
  monthlyContribution: 1000,
  desiredAnnualIncome: 60000
});
```

**Result:**
```javascript
{
  savingsAtRetirement,
  isOnTrack,
  shortfall,
  safeWithdrawalRate,
  estimatedSocialSecurity,
  currentEquityAllocation,
  retirementEquityAllocation
}
```

---

## React Context

### usePortfolio()
```javascript
const {
  holdings,
  totalValue,
  addStock,
  removeStock,
  refreshPrices,
  baseCurrency
} = usePortfolio();
```

---

## Types (TypeScript)

All types defined in `src/types/index.ts`:

```typescript
interface Holding {
  symbol: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
}

interface MonteCarloResult {
  chartData: PercentileDataPoint[];
  statistics: Statistics;
  probabilities: Probability[];
  extremeStats: ExtremeStats;
}

interface RetirementProjection {
  savingsAtRetirement: number;
  isOnTrack: boolean;
  safeWithdrawalRate: number;
}
```

---

## Web Worker

`monteCarloWorker.js` runs simulations off main thread.

```javascript
// Message types
{ type: 'runSimulation', params: {...} }
{ type: 'progress', progress: 0.5 }
{ type: 'complete', result: {...} }
```

---

## API Endpoints

### Alpha Vantage (Stock Prices)
```
GET https://www.alphavantage.co/query
  ?function=GLOBAL_QUOTE
  &symbol=AAPL
  &apikey=YOUR_KEY
```

### Exchange Rates
```
GET https://open.er-api.com/v6/latest/USD
```

---

## Testing

```bash
npm run test:run     # Single run
npm test             # Watch mode
npm run test:coverage
```

**95 tests** covering all core functionality.
