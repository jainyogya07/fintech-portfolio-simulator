/**
 * Educational Content
 * Plain-English explanations for financial concepts
 */

export const TOOLTIPS = {
    // Risk Metrics
    sharpeRatio: {
        title: 'Sharpe Ratio',
        short: 'Return per unit of risk',
        long: `The Sharpe Ratio measures how much extra return you get for the risk you're taking. 
    
A higher Sharpe Ratio means better risk-adjusted returns:
• > 1.0 = Good
• > 2.0 = Very good
• > 3.0 = Excellent

Think of it like: "How many dollars of return do I earn for each dollar of risk I take?"`,
        example: 'If two portfolios both return 10%, but one is twice as volatile, it has half the Sharpe Ratio.'
    },

    volatility: {
        title: 'Volatility',
        short: 'How much your portfolio swings up and down',
        long: `Volatility measures how much your portfolio value changes over time. Higher volatility means bigger swings — both up AND down.

• Low (< 10%): Stable, but potentially lower returns
• Medium (10-20%): Balanced risk/return
• High (> 20%): More risk, potentially higher returns

Volatility isn't good or bad — it depends on your risk tolerance and time horizon.`,
        example: 'A portfolio with 20% volatility might gain or lose 20% in a typical year.'
    },

    var: {
        title: 'Value at Risk (VaR)',
        short: 'Maximum expected loss in normal conditions',
        long: `VaR tells you the maximum amount you could lose in a given time period, with a certain confidence level.

For example, "95% Daily VaR of $500" means:
• On 95 out of 100 days, you won't lose more than $500
• But 5 days out of 100, you might lose MORE than $500

VaR helps you prepare for bad days — but not the worst days.`,
        example: 'A 95% monthly VaR of $2,000 means in 19 out of 20 months, your loss won\'t exceed $2,000.'
    },

    maxDrawdown: {
        title: 'Maximum Drawdown',
        short: 'Biggest drop from peak to bottom',
        long: `Maximum Drawdown is the largest percentage drop from a peak to a trough before a new high is reached.

This matters because:
• A 50% loss requires a 100% gain just to break even
• It shows the worst-case scenario you've already experienced
• It tests your emotional resilience

Lower max drawdown = more stable portfolio.`,
        example: 'If your portfolio dropped from $100K to $60K before recovering, that\'s a 40% max drawdown.'
    },

    correlation: {
        title: 'Correlation',
        short: 'How assets move together',
        long: `Correlation measures whether two assets move in the same direction (-1 to +1):

• +1: Move perfectly together (no diversification)
• 0: Move independently (good diversification)
• -1: Move opposite (perfect hedge)

Lower correlation between your holdings = better diversification = less overall risk.`,
        example: 'Stocks and bonds often have low or negative correlation — when stocks drop, bonds might rise.'
    },

    diversification: {
        title: 'Diversification Score',
        short: 'How well-spread your investments are',
        long: `Diversification reduces risk by spreading investments across different assets that don't move together.

A higher score means:
• Lower overall correlation between holdings
• Less exposure to any single stock or sector
• More stable portfolio performance

"Don't put all your eggs in one basket."`,
        example: 'Holding 10 tech stocks is less diversified than holding 5 tech + 5 healthcare stocks.'
    },

    // Portfolio Metrics
    totalValue: {
        title: 'Total Portfolio Value',
        short: 'Current market value of all holdings',
        long: `This is the sum of all your investment holdings at current market prices.

It changes constantly during market hours as stock prices fluctuate.`,
        example: '10 shares of AAPL at $150 + 5 shares of GOOGL at $140 = $2,200 total value.'
    },

    gainLoss: {
        title: 'Unrealized Gain/Loss',
        short: 'Profit or loss if you sold today',
        long: `Unrealized gain/loss is the difference between what you paid (cost basis) and current market value.

• It's "unrealized" because you haven't actually sold yet
• Only becomes realized when you sell
• Important for tax planning

Green = profit, Red = loss.`,
        example: 'Bought at $100, now worth $120 = $20 unrealized gain (20%).'
    },

    returnPercent: {
        title: 'Return Percentage',
        short: 'How much you\'ve gained or lost',
        long: `Return is calculated as: (Current Value - Cost Basis) / Cost Basis × 100

This tells you the percentage change from your original investment.

• Positive = you've made money
• Negative = you've lost money

Compare to benchmarks like S&P 500 (~10% annually).`,
        example: 'Invested $10,000, now worth $11,500 = 15% return.'
    },

    // Monte Carlo
    monteCarlo: {
        title: 'Monte Carlo Simulation',
        short: 'Thousands of possible futures',
        long: `Monte Carlo runs thousands of random simulations to show the range of possible outcomes.

Instead of one prediction, you see:
• Best-case scenarios (90th percentile)
• Most likely outcomes (50th percentile/median)
• Worst-case scenarios (10th percentile)

This helps you understand uncertainty — the future isn't a single line.`,
        example: 'Run 10,000 simulations: 90% chance of having $500K-$2M at retirement.'
    },

    successRate: {
        title: 'Success Rate',
        short: 'Probability you won\'t run out of money',
        long: `In retirement planning, success rate is the percentage of simulations where your money lasts your entire retirement.

• > 90%: Very safe
• 75-90%: Generally safe
• < 75%: Consider adjustments

Increase success rate by: saving more, retiring later, or spending less.`,
        example: '85% success rate means in 85 out of 100 simulated retirements, your money lasted.'
    },

    // Retirement
    withdrawalRate: {
        title: '4% Rule',
        short: 'Safe annual withdrawal amount',
        long: `The 4% rule suggests you can safely withdraw 4% of your retirement savings each year without running out of money.

For example, with $1M saved:
• Year 1: Withdraw $40,000
• Adjust for inflation each year

This is a guideline, not a guarantee. Your situation may differ.`,
        example: 'To withdraw $60K/year, you need approximately $1.5M saved (60K ÷ 0.04).'
    },

    inflationRate: {
        title: 'Inflation',
        short: 'How prices rise over time',
        long: `Inflation means your money buys less each year. Historically about 3% annually.

This matters for retirement planning because:
• $60K today ≠ $60K in 30 years
• Your withdrawals need to increase over time
• Investments must outpace inflation

This is why keeping money in cash long-term loses value.`,
        example: 'At 3% inflation, $100 today will have the buying power of ~$41 in 30 years.'
    }
};

/**
 * Get tooltip content by key
 */
export function getTooltip(key) {
    return TOOLTIPS[key] || null;
}

/**
 * Get short description
 */
export function getShortTooltip(key) {
    return TOOLTIPS[key]?.short || '';
}
