/**
 * Real Estate Service
 * Property tracking and calculations
 */

const REAL_ESTATE_STORAGE_KEY = 'portfolio-realestate';

/**
 * Load properties from storage
 */
export function loadProperties() {
    try {
        const saved = localStorage.getItem(REAL_ESTATE_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

/**
 * Save properties to storage
 */
export function saveProperties(properties) {
    localStorage.setItem(REAL_ESTATE_STORAGE_KEY, JSON.stringify(properties));
}

/**
 * Add a new property
 */
export function addProperty(property) {
    const properties = loadProperties();
    const newProperty = {
        id: Date.now(),
        ...property,
        createdAt: new Date().toISOString()
    };
    properties.push(newProperty);
    saveProperties(properties);
    return newProperty;
}

/**
 * Update a property
 */
export function updateProperty(id, updates) {
    const properties = loadProperties();
    const index = properties.findIndex(p => p.id === id);
    if (index !== -1) {
        properties[index] = { ...properties[index], ...updates };
        saveProperties(properties);
    }
}

/**
 * Delete a property
 */
export function deleteProperty(id) {
    const properties = loadProperties().filter(p => p.id !== id);
    saveProperties(properties);
}

/**
 * Calculate cap rate
 * Cap Rate = (Net Operating Income / Property Value) × 100
 */
export function calculateCapRate(noi, propertyValue) {
    if (propertyValue <= 0) return 0;
    return (noi / propertyValue) * 100;
}

/**
 * Calculate cash-on-cash return
 * CoC = (Annual Pre-Tax Cash Flow / Total Cash Invested) × 100
 */
export function calculateCashOnCash(annualCashFlow, cashInvested) {
    if (cashInvested <= 0) return 0;
    return (annualCashFlow / cashInvested) * 100;
}

/**
 * Calculate monthly cash flow
 */
export function calculateMonthlyCashFlow(property) {
    const {
        monthlyRent = 0,
        mortgage = 0,
        propertyTax = 0,
        insurance = 0,
        hoa = 0,
        maintenance = 0,
        management = 0,
        vacancy = 0
    } = property;

    const grossIncome = monthlyRent;
    const vacancyLoss = (vacancy / 100) * monthlyRent;
    const effectiveIncome = grossIncome - vacancyLoss;

    const totalExpenses = mortgage + (propertyTax / 12) + (insurance / 12) + hoa + maintenance + management;

    return {
        grossIncome,
        vacancyLoss,
        effectiveIncome,
        totalExpenses,
        netCashFlow: effectiveIncome - totalExpenses
    };
}

/**
 * Calculate equity and appreciation
 */
export function calculateEquity(property) {
    const { purchasePrice = 0, currentValue = 0, loanBalance = 0, downPayment = 0 } = property;

    const currentEquity = currentValue - loanBalance;
    const appreciation = currentValue - purchasePrice;
    const appreciationPercent = purchasePrice > 0 ? (appreciation / purchasePrice) * 100 : 0;
    const equityGrowth = currentEquity - downPayment;

    return {
        currentEquity,
        appreciation,
        appreciationPercent,
        equityGrowth,
        ltv: currentValue > 0 ? (loanBalance / currentValue) * 100 : 0
    };
}

/**
 * Property types
 */
export const PROPERTY_TYPES = [
    { id: 'sfh', name: 'Single Family Home', icon: '🏠' },
    { id: 'condo', name: 'Condo/Apartment', icon: '🏢' },
    { id: 'multi', name: 'Multi-Family', icon: '🏘️' },
    { id: 'commercial', name: 'Commercial', icon: '🏬' },
    { id: 'land', name: 'Land', icon: '🌳' }
];
