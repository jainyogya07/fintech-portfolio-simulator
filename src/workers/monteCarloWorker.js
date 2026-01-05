/**
 * Monte Carlo Simulation Web Worker
 * Professional-grade simulations with fat tails and regime detection
 */

// Box-Muller transform for normal random numbers
function randomNormal() {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Generate Student's t distributed random number (fat tails)
 * More realistic for financial markets - captures crash events
 * @param {number} df - Degrees of freedom (5-7 for financial markets)
 */
function randomStudentT(df = 5) {
    // Student's t = Normal / sqrt(Chi-squared/df)
    const normal = randomNormal();

    // Generate chi-squared with df degrees of freedom
    let chiSquared = 0;
    for (let i = 0; i < df; i++) {
        const z = randomNormal();
        chiSquared += z * z;
    }

    return normal / Math.sqrt(chiSquared / df);
}

/**
 * Detect market regime based on recent volatility
 * @param {number} recentVol - Recent realized volatility
 * @param {number} longTermVol - Long-term average volatility
 * @returns {Object} - Regime parameters
 */
function detectRegime(recentVol, longTermVol) {
    const volRatio = recentVol / longTermVol;

    if (volRatio > 1.5) {
        // Crisis regime: lower returns, higher vol
        return {
            name: 'crisis',
            returnMultiplier: 0.5,
            volMultiplier: 1.5,
            probability: 0.1
        };
    } else if (volRatio > 1.2) {
        // High volatility regime
        return {
            name: 'high_vol',
            returnMultiplier: 0.8,
            volMultiplier: 1.2,
            probability: 0.2
        };
    } else if (volRatio < 0.7) {
        // Low volatility regime (complacency)
        return {
            name: 'low_vol',
            returnMultiplier: 1.1,
            volMultiplier: 0.8,
            probability: 0.2
        };
    }
    // Normal regime
    return {
        name: 'normal',
        returnMultiplier: 1,
        volMultiplier: 1,
        probability: 0.5
    };
}

/**
 * Run Monte Carlo simulation using Geometric Brownian Motion with fat tails
 * @param {Object} params - Simulation parameters
 */
function runSimulation(params) {
    const {
        portfolioValue,
        annualReturn = 0.07,  // Expected 7% annual return
        volatility,           // Annual volatility as decimal (e.g., 0.20 for 20%)
        years,
        numSimulations,
        stepsPerYear = 252,   // Trading days
        useFatTails = true,   // Enable Student's t distribution
        degreesOfFreedom = 5  // Fat tail parameter (lower = fatter tails)
    } = params;

    const dt = 1 / stepsPerYear;
    const totalSteps = years * stepsPerYear;

    // Store all simulation paths
    const allPaths = [];

    // Track additional statistics
    let crashCount = 0;        // Sims with >50% drawdown
    let boomCount = 0;         // Sims with >200% return
    let negativeCount = 0;     // Sims ending below start

    // Run simulations
    for (let sim = 0; sim < numSimulations; sim++) {
        const path = [portfolioValue];
        let value = portfolioValue;
        let peak = portfolioValue;
        let maxDrawdown = 0;

        for (let step = 0; step < totalSteps; step++) {
            // Generate random shock (normal or fat-tailed)
            const shock = useFatTails ? randomStudentT(degreesOfFreedom) : randomNormal();

            // Geometric Brownian Motion with drift adjustment for fat tails
            // dS = S * (μ*dt + σ*√dt*Z)
            const drift = (annualReturn - 0.5 * volatility * volatility) * dt;
            const diffusion = volatility * Math.sqrt(dt) * shock;

            // Apply return (with floor to prevent negative values)
            const returnFactor = Math.exp(drift + diffusion);
            value = Math.max(value * returnFactor, 0.01);

            // Track drawdown
            peak = Math.max(peak, value);
            const drawdown = (peak - value) / peak;
            maxDrawdown = Math.max(maxDrawdown, drawdown);

            // Store value at each year mark and final step
            if ((step + 1) % stepsPerYear === 0 || step === totalSteps - 1) {
                path.push(value);
            }
        }

        allPaths.push(path);

        // Track extreme outcomes
        const totalReturn = (value - portfolioValue) / portfolioValue;
        if (maxDrawdown > 0.5) crashCount++;
        if (totalReturn > 2) boomCount++;
        if (value < portfolioValue) negativeCount++;

        // Report progress every 1000 simulations
        if ((sim + 1) % 1000 === 0) {
            self.postMessage({
                type: 'progress',
                progress: (sim + 1) / numSimulations
            });
        }
    }

    return {
        paths: allPaths,
        extremeStats: {
            crashProbability: (crashCount / numSimulations) * 100,
            boomProbability: (boomCount / numSimulations) * 100,
            lossProbability: (negativeCount / numSimulations) * 100
        }
    };
}

/**
 * Calculate percentiles from simulation paths
 */
function calculatePercentiles(paths, percentiles = [10, 25, 50, 75, 90]) {
    const numYears = paths[0].length;
    const result = {};

    percentiles.forEach(p => {
        result[`p${p}`] = [];
    });

    for (let yearIdx = 0; yearIdx < numYears; yearIdx++) {
        const valuesAtYear = paths.map(path => path[yearIdx]).sort((a, b) => a - b);

        percentiles.forEach(p => {
            const idx = Math.floor((p / 100) * valuesAtYear.length);
            result[`p${p}`].push(valuesAtYear[idx]);
        });
    }

    return result;
}

/**
 * Calculate probability of reaching certain thresholds
 */
function calculateProbabilities(paths, thresholds) {
    const finalValues = paths.map(path => path[path.length - 1]);
    const numSims = finalValues.length;

    return thresholds.map(threshold => {
        const count = finalValues.filter(v => v >= threshold).length;
        return {
            threshold,
            probability: (count / numSims) * 100
        };
    });
}

/**
 * Calculate statistics for final values
 */
function calculateStatistics(paths) {
    const finalValues = paths.map(path => path[path.length - 1]);

    finalValues.sort((a, b) => a - b);

    const sum = finalValues.reduce((a, b) => a + b, 0);
    const mean = sum / finalValues.length;

    const squaredDiffs = finalValues.map(v => Math.pow(v - mean, 2));
    const stdDev = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / finalValues.length);

    const min = finalValues[0];
    const max = finalValues[finalValues.length - 1];
    const median = finalValues[Math.floor(finalValues.length / 2)];

    return {
        mean: Math.round(mean * 100) / 100,
        median: Math.round(median * 100) / 100,
        stdDev: Math.round(stdDev * 100) / 100,
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100
    };
}

// Handle messages from main thread
self.onmessage = function (e) {
    const { type, params } = e.data;

    if (type === 'runSimulation') {
        try {
            self.postMessage({ type: 'started' });

            const simulationResult = runSimulation(params);
            const { paths, extremeStats } = simulationResult;

            const percentiles = calculatePercentiles(paths);
            const statistics = calculateStatistics(paths);

            // Calculate probability thresholds based on initial value
            const initialValue = params.portfolioValue;
            const thresholds = [
                initialValue * 0.5,   // 50% of initial
                initialValue * 0.75,  // 75% of initial
                initialValue,         // Break even
                initialValue * 1.5,   // 50% gain
                initialValue * 2,     // 100% gain (double)
                initialValue * 3      // 200% gain (triple)
            ];

            const probabilities = calculateProbabilities(paths, thresholds);

            // Create chart data points
            const chartData = [];
            for (let year = 0; year <= params.years; year++) {
                chartData.push({
                    year,
                    p10: percentiles.p10[year],
                    p25: percentiles.p25[year],
                    p50: percentiles.p50[year],
                    p75: percentiles.p75[year],
                    p90: percentiles.p90[year]
                });
            }

            self.postMessage({
                type: 'complete',
                result: {
                    chartData,
                    percentiles,
                    statistics,
                    probabilities,
                    extremeStats,  // NEW: crash/boom/loss probabilities
                    params
                }
            });
        } catch (error) {
            self.postMessage({
                type: 'error',
                error: error.message
            });
        }
    }
};
