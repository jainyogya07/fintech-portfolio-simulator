/**
 * API Documentation
 * Defines available endpoints and calculations
 */

export const API_VERSION = '1.0.0';
export const API_BASE_URL = 'https://api.portfolio-simulator.dev';

export const API_ENDPOINTS = [
    {
        category: 'Risk Analysis',
        endpoints: [
            {
                method: 'POST',
                path: '/v1/risk/var',
                name: 'Calculate Value at Risk',
                description: 'Calculate VaR for a portfolio at specified confidence level',
                parameters: [
                    { name: 'holdings', type: 'array', required: true, description: 'Array of holdings with symbol, shares, price' },
                    { name: 'confidence', type: 'number', required: false, default: 0.95, description: 'Confidence level (0.90, 0.95, 0.99)' },
                    { name: 'period', type: 'string', required: false, default: 'daily', description: 'Time period (daily, weekly, monthly)' }
                ],
                response: {
                    var: 1234.56,
                    varPercent: 5.2,
                    confidence: 0.95,
                    period: 'daily'
                },
                rateLimit: '100/hour'
            },
            {
                method: 'POST',
                path: '/v1/risk/sharpe',
                name: 'Calculate Sharpe Ratio',
                description: 'Calculate risk-adjusted returns',
                parameters: [
                    { name: 'returns', type: 'array', required: true, description: 'Array of historical returns' },
                    { name: 'riskFreeRate', type: 'number', required: false, default: 0.03, description: 'Risk-free rate (annual)' }
                ],
                response: {
                    sharpe: 1.45,
                    excessReturn: 0.12,
                    volatility: 0.15
                },
                rateLimit: '100/hour'
            },
            {
                method: 'POST',
                path: '/v1/risk/correlation',
                name: 'Calculate Correlation Matrix',
                description: 'Generate correlation heatmap for holdings',
                parameters: [
                    { name: 'symbols', type: 'array', required: true, description: 'Array of stock symbols' },
                    { name: 'period', type: 'string', required: false, default: '1y', description: 'Historical period' }
                ],
                response: {
                    matrix: [[1, 0.8], [0.8, 1]],
                    symbols: ['AAPL', 'MSFT']
                },
                rateLimit: '50/hour'
            }
        ]
    },
    {
        category: 'Simulations',
        endpoints: [
            {
                method: 'POST',
                path: '/v1/simulate/montecarlo',
                name: 'Monte Carlo Simulation',
                description: 'Run Monte Carlo simulations for portfolio projections',
                parameters: [
                    { name: 'initialValue', type: 'number', required: true, description: 'Starting portfolio value' },
                    { name: 'years', type: 'number', required: true, description: 'Simulation years' },
                    { name: 'expectedReturn', type: 'number', required: false, default: 0.07, description: 'Expected annual return' },
                    { name: 'volatility', type: 'number', required: false, default: 0.15, description: 'Annual volatility' },
                    { name: 'simulations', type: 'number', required: false, default: 1000, description: 'Number of simulations' }
                ],
                response: {
                    percentiles: { p5: 45000, p25: 67000, p50: 89000, p75: 112000, p95: 156000 },
                    successRate: 0.78,
                    medianValue: 89000
                },
                rateLimit: '30/hour'
            },
            {
                method: 'POST',
                path: '/v1/simulate/crash',
                name: 'Crash Simulation',
                description: 'Simulate historical crash scenarios on portfolio',
                parameters: [
                    { name: 'holdings', type: 'array', required: true, description: 'Portfolio holdings' },
                    { name: 'scenario', type: 'string', required: true, description: 'dotcom, 2008, covid, 1987, inflation' }
                ],
                response: {
                    originalValue: 100000,
                    crashedValue: 62000,
                    percentLoss: 38,
                    recoveryMonths: 24
                },
                rateLimit: '50/hour'
            }
        ]
    },
    {
        category: 'Predictions',
        endpoints: [
            {
                method: 'POST',
                path: '/v1/predict/returns',
                name: 'Predict Returns',
                description: 'Generate return forecasts with confidence intervals',
                parameters: [
                    { name: 'holdings', type: 'array', required: true, description: 'Portfolio holdings' },
                    { name: 'forecastDays', type: 'number', required: false, default: 30, description: 'Forecast horizon in days' }
                ],
                response: {
                    predictions: { pessimistic: -8.2, expected: 2.1, bullish: 12.4 },
                    confidence: { low: 92000, high: 112000 }
                },
                rateLimit: '50/hour'
            }
        ]
    },
    {
        category: 'Optimization',
        endpoints: [
            {
                method: 'POST',
                path: '/v1/optimize/rebalance',
                name: 'Calculate Rebalancing Trades',
                description: 'Get exact trades needed to reach target allocation',
                parameters: [
                    { name: 'holdings', type: 'array', required: true, description: 'Current holdings' },
                    { name: 'targets', type: 'object', required: true, description: 'Target allocations by symbol' }
                ],
                response: {
                    trades: [{ action: 'BUY', symbol: 'VTI', amount: 500 }],
                    netCash: -500
                },
                rateLimit: '100/hour'
            }
        ]
    }
];

export const PRICING_TIERS = [
    {
        name: 'Free',
        price: '$0',
        limits: '100 requests/day',
        features: ['Basic risk calculations', 'VaR & Sharpe', 'Monte Carlo (100 sims)']
    },
    {
        name: 'Developer',
        price: '$29/mo',
        limits: '10,000 requests/day',
        features: ['All calculations', 'ML Predictions', 'Priority support', 'Webhooks']
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        limits: 'Unlimited',
        features: ['Dedicated instance', 'SLA', 'Custom integrations', 'White-label']
    }
];

export const CODE_EXAMPLES = {
    javascript: `// Calculate VaR for your portfolio
const response = await fetch('${API_BASE_URL}/v1/risk/var', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    holdings: [
      { symbol: 'AAPL', shares: 100, price: 189 },
      { symbol: 'MSFT', shares: 50, price: 378 }
    ],
    confidence: 0.95
  })
});

const data = await response.json();
console.log('VaR:', data.var);`,

    python: `import requests

response = requests.post(
    '${API_BASE_URL}/v1/risk/var',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY'
    },
    json={
        'holdings': [
            {'symbol': 'AAPL', 'shares': 100, 'price': 189},
            {'symbol': 'MSFT', 'shares': 50, 'price': 378}
        ],
        'confidence': 0.95
    }
)

data = response.json()
print(f"VaR: {data['var']}")`,

    curl: `curl -X POST ${API_BASE_URL}/v1/risk/var \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "holdings": [
      {"symbol": "AAPL", "shares": 100, "price": 189}
    ],
    "confidence": 0.95
  }'`
};
