/**
 * Report Generator Service
 * Generate downloadable portfolio reports
 */

import { formatCurrency, formatPercentage, calculatePortfolioVolatility } from './calculations';
import { getStockSector } from '../config/crashScenarios';

/**
 * Generate HTML report content
 */
export function generateReportHTML(portfolioData) {
    const {
        holdings,
        totalValue,
        totalCost,
        totalGain,
        gainPercent,
        riskMetrics
    } = portfolioData;

    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio Report - ${today}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      background: #f8fafc;
      padding: 40px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e2e8f0;
    }
    .header h1 {
      font-size: 28px;
      color: #6366f1;
      margin-bottom: 8px;
    }
    .header p { color: #64748b; }
    .section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .section h2 {
      font-size: 18px;
      color: #1a1a2e;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section h2::before {
      content: '';
      display: block;
      width: 4px;
      height: 20px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      border-radius: 2px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .summary-card {
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-card .label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-card .value {
      font-size: 24px;
      font-weight: 700;
      margin-top: 4px;
    }
    .positive { color: #10b981; }
    .negative { color: #ef4444; }
    .primary { color: #6366f1; }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    th {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    td { font-size: 14px; }
    .risk-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .risk-item {
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
    }
    .risk-item .label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .risk-item .value {
      font-size: 20px;
      font-weight: 600;
    }
    .footer {
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 12px;
    }
    @media print {
      body { padding: 20px; }
      .section { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>📊 Portfolio Report</h1>
      <p>Generated on ${today}</p>
    </header>

    <section class="section">
      <h2>Portfolio Summary</h2>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="label">Total Value</div>
          <div class="value primary">${formatCurrency(totalValue)}</div>
        </div>
        <div class="summary-card">
          <div class="label">Total Cost</div>
          <div class="value">${formatCurrency(totalCost)}</div>
        </div>
        <div class="summary-card">
          <div class="label">Total Return</div>
          <div class="value ${totalGain >= 0 ? 'positive' : 'negative'}">
            ${totalGain >= 0 ? '+' : ''}${formatCurrency(totalGain)} (${gainPercent >= 0 ? '+' : ''}${gainPercent.toFixed(2)}%)
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>Holdings</h2>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Shares</th>
            <th>Avg Cost</th>
            <th>Current Price</th>
            <th>Value</th>
            <th>Return</th>
          </tr>
        </thead>
        <tbody>
          ${holdings.map(h => {
        const value = h.currentPrice * h.shares;
        const cost = h.purchasePrice * h.shares;
        const gain = value - cost;
        const gainPct = ((gain / cost) * 100).toFixed(2);
        return `
              <tr>
                <td><strong>${h.symbol}</strong></td>
                <td>${h.shares}</td>
                <td>${formatCurrency(h.purchasePrice)}</td>
                <td>${formatCurrency(h.currentPrice)}</td>
                <td>${formatCurrency(value)}</td>
                <td class="${gain >= 0 ? 'positive' : 'negative'}">
                  ${gain >= 0 ? '+' : ''}${gainPct}%
                </td>
              </tr>
            `;
    }).join('')}
        </tbody>
      </table>
    </section>

    ${riskMetrics ? `
    <section class="section">
      <h2>Risk Analysis</h2>
      <div class="risk-grid">
        ${riskMetrics.volatility !== undefined ? `
        <div class="risk-item">
          <div class="label">Volatility (Annualized)</div>
          <div class="value">${riskMetrics.volatility.toFixed(1)}%</div>
        </div>
        ` : ''}
        ${riskMetrics.sharpeRatio !== undefined ? `
        <div class="risk-item">
          <div class="label">Sharpe Ratio</div>
          <div class="value">${riskMetrics.sharpeRatio.toFixed(2)}</div>
        </div>
        ` : ''}
        ${riskMetrics.dailyVaR !== undefined ? `
        <div class="risk-item">
          <div class="label">Daily VaR (95%)</div>
          <div class="value negative">${formatCurrency(riskMetrics.dailyVaR)}</div>
        </div>
        ` : ''}
        ${riskMetrics.maxDrawdown !== undefined ? `
        <div class="risk-item">
          <div class="label">Max Drawdown</div>
          <div class="value negative">-${riskMetrics.maxDrawdown.toFixed(1)}%</div>
        </div>
        ` : ''}
      </div>
    </section>
    ` : ''}

    <section class="section">
      <h2>Sector Allocation</h2>
      <table>
        <thead>
          <tr>
            <th>Sector</th>
            <th>Value</th>
            <th>Weight</th>
          </tr>
        </thead>
        <tbody>
          ${generateSectorAllocation(holdings, totalValue)}
        </tbody>
      </table>
    </section>

    <footer class="footer">
      <p>Generated by Portfolio Simulator • For educational purposes only</p>
      <p>Market data may be delayed. This is not financial advice.</p>
    </footer>
  </div>
</body>
</html>
  `;
}

/**
 * Generate sector allocation table rows
 */
function generateSectorAllocation(holdings, totalValue) {
    const sectors = {};

    holdings.forEach(h => {
        const sector = getStockSector(h.symbol);
        const value = h.currentPrice * h.shares;

        if (!sectors[sector]) {
            sectors[sector] = 0;
        }
        sectors[sector] += value;
    });

    return Object.entries(sectors)
        .sort((a, b) => b[1] - a[1])
        .map(([sector, value]) => {
            const weight = ((value / totalValue) * 100).toFixed(1);
            return `
        <tr>
          <td style="text-transform: capitalize;">${sector}</td>
          <td>${formatCurrency(value)}</td>
          <td>${weight}%</td>
        </tr>
      `;
        })
        .join('');
}

/**
 * Download report as HTML file
 */
export function downloadReport(portfolioData) {
    const html = generateReportHTML(portfolioData);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().split('T')[0];
    const filename = `portfolio-report-${date}.html`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Print report
 */
export function printReport(portfolioData) {
    const html = generateReportHTML(portfolioData);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}
