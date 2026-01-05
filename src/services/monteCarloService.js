/**
 * Monte Carlo Simulation Service
 * Interface for running simulations via Web Worker
 */

let worker = null;

/**
 * Initialize or get the Web Worker
 */
function getWorker() {
    if (!worker) {
        worker = new Worker(
            new URL('../workers/monteCarloWorker.js', import.meta.url),
            { type: 'module' }
        );
    }
    return worker;
}

/**
 * Run Monte Carlo simulation
 * @param {Object} params - Simulation parameters
 * @param {number} params.portfolioValue - Current portfolio value
 * @param {number} params.volatility - Annual volatility as percentage (e.g., 20 for 20%)
 * @param {number} params.years - Simulation time horizon
 * @param {number} params.numSimulations - Number of simulation paths (default 10000)
 * @param {number} params.expectedReturn - Expected annual return (default 0.07 for 7%)
 * @param {Function} onProgress - Progress callback (0-1)
 * @returns {Promise<Object>} - Simulation results
 */
export function runMonteCarloSimulation({
    portfolioValue,
    volatility,
    years = 10,
    numSimulations = 10000,
    expectedReturn = 0.07,
    onProgress = () => { }
}) {
    return new Promise((resolve, reject) => {
        const simulationWorker = getWorker();

        const handleMessage = (e) => {
            const { type, progress, result, error } = e.data;

            switch (type) {
                case 'started':
                    onProgress(0);
                    break;
                case 'progress':
                    onProgress(progress);
                    break;
                case 'complete':
                    simulationWorker.removeEventListener('message', handleMessage);
                    resolve(result);
                    break;
                case 'error':
                    simulationWorker.removeEventListener('message', handleMessage);
                    reject(new Error(error));
                    break;
            }
        };

        simulationWorker.addEventListener('message', handleMessage);

        simulationWorker.postMessage({
            type: 'runSimulation',
            params: {
                portfolioValue,
                volatility: volatility / 100, // Convert from percentage to decimal
                years,
                numSimulations,
                annualReturn: expectedReturn
            }
        });
    });
}

/**
 * Format simulation results for display
 * @param {Object} result - Raw simulation result
 * @returns {Object} - Formatted display data
 */
export function formatSimulationResults(result) {
    const { statistics, probabilities, params } = result;
    const initialValue = params.portfolioValue;

    // Calculate return metrics
    const expectedFinalValue = statistics.median;
    const totalReturn = ((expectedFinalValue - initialValue) / initialValue) * 100;
    const annualizedReturn = Math.pow(expectedFinalValue / initialValue, 1 / params.years) - 1;

    // Format probability thresholds
    const formattedProbabilities = probabilities.map(p => ({
        threshold: p.threshold,
        probability: Math.round(p.probability * 10) / 10,
        label: getThresholdLabel(p.threshold, initialValue)
    }));

    return {
        summary: {
            initialValue,
            expectedValue: statistics.median,
            bestCase: statistics.max,
            worstCase: statistics.min,
            totalReturn: Math.round(totalReturn * 100) / 100,
            annualizedReturn: Math.round(annualizedReturn * 10000) / 100,
            years: params.years,
            simulations: params.numSimulations
        },
        probabilities: formattedProbabilities,
        ranges: {
            likely: {
                low: result.chartData[result.chartData.length - 1].p25,
                high: result.chartData[result.chartData.length - 1].p75,
                label: '50% of outcomes'
            },
            possible: {
                low: result.chartData[result.chartData.length - 1].p10,
                high: result.chartData[result.chartData.length - 1].p90,
                label: '80% of outcomes'
            }
        }
    };
}

/**
 * Get human-readable label for threshold
 */
function getThresholdLabel(threshold, initialValue) {
    const ratio = threshold / initialValue;

    if (ratio < 0.6) return 'Lose 50%+';
    if (ratio < 0.8) return 'Lose 25%+';
    if (ratio < 1.05) return 'Break even';
    if (ratio < 1.6) return 'Gain 50%';
    if (ratio < 2.1) return 'Double money';
    return 'Triple money';
}

/**
 * Cancel any running simulation
 */
export function cancelSimulation() {
    if (worker) {
        worker.terminate();
        worker = null;
    }
}
