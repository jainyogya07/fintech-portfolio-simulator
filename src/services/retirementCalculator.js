/**
 * Calculate retirement projections with smart glide path
 */
export function calculateRetirement({
    currentAge,
    retirementAge,
    currentSavings,
    monthlyContribution,
    expectedReturn = 0.07,
    inflationRate = 0.03,
    desiredAnnualIncome,
    lifeExpectancy = 90
}) {
    const yearsUntilRetirement = retirementAge - currentAge;
    const monthsUntilRetirement = yearsUntilRetirement * 12;

    // SMART: Age-based glide path - reduce equity exposure as you age
    // Target equity allocation = 110 - age (classic rule)
    const currentEquityAllocation = Math.max(0.2, Math.min(0.9, (110 - currentAge) / 100));
    const retirementEquityAllocation = Math.max(0.2, Math.min(0.5, (110 - retirementAge) / 100));

    // Blend return based on current allocation (stocks: 10%, bonds: 4%)
    const blendedReturn = currentEquityAllocation * expectedReturn + (1 - currentEquityAllocation) * 0.04;
    const monthlyReturn = blendedReturn / 12;

    // Calculate future value at retirement (with contributions)
    let savingsAtRetirement = currentSavings;

    for (let month = 0; month < monthsUntilRetirement; month++) {
        // Gradually reduce return assumption as equity allocation decreases
        const yearsIn = month / 12;
        const progressToRetirement = yearsIn / yearsUntilRetirement;
        const currentAllocation = currentEquityAllocation - progressToRetirement * (currentEquityAllocation - retirementEquityAllocation);
        const currentReturn = currentAllocation * expectedReturn + (1 - currentAllocation) * 0.04;

        savingsAtRetirement = savingsAtRetirement * (1 + currentReturn / 12) + monthlyContribution;
    }

    // Adjust desired income for inflation
    const futureInflationMultiplier = Math.pow(1 + inflationRate, yearsUntilRetirement);
    const futureAnnualIncome = desiredAnnualIncome * futureInflationMultiplier;

    // SMART: Use dynamic withdrawal rate based on retirement length
    // Shorter retirement = can withdraw more safely
    const yearsInRetirement = lifeExpectancy - retirementAge;
    const safeWithdrawalRate = calculateDynamicWithdrawalRate(yearsInRetirement);

    // Calculate required savings using dynamic rate
    const requiredSavings = futureAnnualIncome / safeWithdrawalRate;

    // Can they afford it?
    const shortfall = requiredSavings - savingsAtRetirement;
    const isOnTrack = shortfall <= 0;

    // Calculate required monthly contribution to be on track
    const requiredMonthlyContribution = calculateRequiredContribution(
        currentSavings,
        requiredSavings,
        monthsUntilRetirement,
        monthlyReturn
    );

    // Projected income from savings
    const projectedAnnualIncome = savingsAtRetirement * safeWithdrawalRate;
    const projectedMonthlyIncome = projectedAnnualIncome / 12;

    // Today's dollars equivalent
    const projectedIncomeToday = projectedAnnualIncome / futureInflationMultiplier;

    // SMART: Estimate Social Security (rough estimate based on contribution)
    const estimatedSS = estimateSocialSecurity(monthlyContribution * 12, currentAge, retirementAge);

    return {
        yearsUntilRetirement,
        savingsAtRetirement: Math.round(savingsAtRetirement),
        requiredSavings: Math.round(requiredSavings),
        shortfall: Math.max(0, Math.round(shortfall)),
        surplus: Math.max(0, Math.round(-shortfall)),
        isOnTrack,
        monthlyShortfall: shortfall > 0 ? Math.round(shortfall / monthsUntilRetirement) : 0,
        requiredMonthlyContribution: Math.round(requiredMonthlyContribution),
        additionalMonthlyNeeded: Math.max(0, Math.round(requiredMonthlyContribution - monthlyContribution)),
        projectedMonthlyIncome: Math.round(projectedMonthlyIncome),
        projectedAnnualIncome: Math.round(projectedAnnualIncome),
        projectedIncomeToday: Math.round(projectedIncomeToday),
        desiredMonthlyIncome: Math.round(futureAnnualIncome / 12),
        replacementRatio: Math.round((projectedIncomeToday / desiredAnnualIncome) * 100),
        estimatedSocialSecurity: Math.round(estimatedSS),
        currentEquityAllocation: Math.round(currentEquityAllocation * 100),
        retirementEquityAllocation: Math.round(retirementEquityAllocation * 100),
        safeWithdrawalRate: Math.round(safeWithdrawalRate * 1000) / 10,
        assumptions: {
            expectedReturn: expectedReturn * 100,
            inflationRate: inflationRate * 100,
            withdrawalRate: Math.round(safeWithdrawalRate * 1000) / 10,
            yearsInRetirement: yearsInRetirement,
            glidePath: `${Math.round(currentEquityAllocation * 100)}% → ${Math.round(retirementEquityAllocation * 100)}%`
        }
    };
}

/**
 * Calculate dynamic safe withdrawal rate based on retirement length
 * Based on Bengen/Trinity study adjustments
 */
function calculateDynamicWithdrawalRate(yearsInRetirement) {
    if (yearsInRetirement <= 20) return 0.05;      // 5% for short retirement
    if (yearsInRetirement <= 25) return 0.045;     // 4.5%
    if (yearsInRetirement <= 30) return 0.04;      // 4% classic
    if (yearsInRetirement <= 35) return 0.035;     // 3.5%
    return 0.03;                                    // 3% for very long retirement
}

/**
 * Estimate Social Security benefits (rough calculation)
 * Based on average indexed monthly earnings
 */
function estimateSocialSecurity(annualIncome, currentAge, retirementAge) {
    // Very rough estimate - actual SS is complex
    // Assumes 35 years of earnings at current income level
    const aime = (annualIncome * 0.7) / 12; // AIME is about 70% of gross for most

    // PIA calculation (simplified 2024 bend points)
    let pia = 0;
    if (aime <= 1174) {
        pia = aime * 0.9;
    } else if (aime <= 7078) {
        pia = 1174 * 0.9 + (aime - 1174) * 0.32;
    } else {
        pia = 1174 * 0.9 + (7078 - 1174) * 0.32 + (aime - 7078) * 0.15;
    }

    // Adjust for retirement age (vs full retirement age of 67)
    const fra = 67;
    const ageAdjustment = retirementAge >= fra
        ? 1 + (retirementAge - fra) * 0.08  // Delayed credits
        : 1 - (fra - retirementAge) * 0.067; // Early reduction

    return Math.min(pia * ageAdjustment * 12, 50000); // Cap at ~$50k/year
}

/**
 * Calculate required monthly contribution to reach target
 */
function calculateRequiredContribution(current, target, months, monthlyRate) {
    const fvOfCurrent = current * Math.pow(1 + monthlyRate, months);
    const remaining = target - fvOfCurrent;

    if (remaining <= 0) return 0;

    const annuityFactor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
    return remaining / annuityFactor;
}

/**
 * Generate random return using Box-Muller transform
 */
function generateRandomReturn(mean, stdDev) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + stdDev * z0;
}

/**
 * Monte Carlo simulation for retirement
 */
export function simulateRetirementOutcomes({
    currentSavings,
    monthlyContribution,
    yearsUntilRetirement,
    yearsInRetirement,
    portfolioReturn = 0.07,
    portfolioVolatility = 0.15,
    annualWithdrawal,
    simulations = 5000
}) {
    const results = [];

    for (let sim = 0; sim < simulations; sim++) {
        let balance = currentSavings;

        // Accumulation phase
        for (let year = 0; year < yearsUntilRetirement; year++) {
            const annualReturn = generateRandomReturn(portfolioReturn, portfolioVolatility);
            balance = balance * (1 + annualReturn) + (monthlyContribution * 12);
        }

        const retirementBalance = balance;
        let ranOutOfMoney = false;
        let yearsUntilBroke = yearsInRetirement;

        // Withdrawal phase (with lower returns assumption in retirement)
        const retirementReturn = portfolioReturn * 0.8; // More conservative in retirement
        const retirementVolatility = portfolioVolatility * 0.8;

        for (let year = 0; year < yearsInRetirement; year++) {
            balance -= annualWithdrawal;

            if (balance <= 0) {
                ranOutOfMoney = true;
                yearsUntilBroke = year;
                break;
            }

            const annualReturn = generateRandomReturn(retirementReturn, retirementVolatility);
            balance = balance * (1 + Math.max(-0.3, annualReturn)); // Cap losses at 30%
        }

        results.push({
            retirementBalance,
            finalBalance: Math.max(0, balance),
            ranOutOfMoney,
            yearsUntilBroke
        });
    }

    // Analyze results
    const successCount = results.filter(r => !r.ranOutOfMoney).length;
    const successRate = (successCount / simulations) * 100;

    const retirementBalances = results.map(r => r.retirementBalance).sort((a, b) => a - b);
    const finalBalances = results.map(r => r.finalBalance).sort((a, b) => a - b);

    const failedSimulations = results.filter(r => r.ranOutOfMoney);
    const averageYearsIfFailed = failedSimulations.length > 0
        ? failedSimulations.reduce((sum, r) => sum + r.yearsUntilBroke, 0) / failedSimulations.length
        : 0;

    return {
        successRate: Math.round(successRate * 10) / 10,
        failureRate: Math.round((100 - successRate) * 10) / 10,
        medianRetirementBalance: Math.round(retirementBalances[Math.floor(simulations * 0.5)]),
        percentile10: Math.round(retirementBalances[Math.floor(simulations * 0.1)]),
        percentile25: Math.round(retirementBalances[Math.floor(simulations * 0.25)]),
        percentile75: Math.round(retirementBalances[Math.floor(simulations * 0.75)]),
        percentile90: Math.round(retirementBalances[Math.floor(simulations * 0.9)]),
        medianFinalBalance: Math.round(finalBalances[Math.floor(simulations * 0.5)]),
        averageYearsIfFailed: Math.round(averageYearsIfFailed * 10) / 10,
        simulations
    };
}

/**
 * Get retirement readiness rating
 */
export function getRetirementRating(successRate) {
    if (successRate >= 90) return { label: 'Excellent', color: 'var(--color-success)', emoji: '🎉' };
    if (successRate >= 75) return { label: 'Good', color: 'var(--color-success)', emoji: '✅' };
    if (successRate >= 60) return { label: 'Fair', color: 'var(--color-warning)', emoji: '⚠️' };
    if (successRate >= 40) return { label: 'At Risk', color: 'var(--color-warning)', emoji: '⚡' };
    return { label: 'High Risk', color: 'var(--color-danger)', emoji: '🚨' };
}
