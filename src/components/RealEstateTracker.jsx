import { useState, useEffect, useCallback } from 'react';
import {
    loadProperties,
    addProperty,
    deleteProperty,
    calculateMonthlyCashFlow,
    calculateEquity,
    calculateCapRate,
    PROPERTY_TYPES
} from '../services/realEstateService';
import { formatCurrency } from '../services/calculations';

export default function RealEstateTracker() {
    const [properties, setProperties] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newProperty, setNewProperty] = useState({
        name: '',
        type: 'sfh',
        purchasePrice: '',
        currentValue: '',
        downPayment: '',
        loanBalance: '',
        monthlyRent: '',
        mortgage: '',
        propertyTax: '',
        insurance: '',
        hoa: 0,
        maintenance: '',
        vacancy: 5
    });

    useEffect(() => {
        setProperties(loadProperties());
    }, []);

    const handleAdd = useCallback(() => {
        if (!newProperty.name || !newProperty.currentValue) return;

        const property = {
            ...newProperty,
            purchasePrice: Number(newProperty.purchasePrice) || 0,
            currentValue: Number(newProperty.currentValue) || 0,
            downPayment: Number(newProperty.downPayment) || 0,
            loanBalance: Number(newProperty.loanBalance) || 0,
            monthlyRent: Number(newProperty.monthlyRent) || 0,
            mortgage: Number(newProperty.mortgage) || 0,
            propertyTax: Number(newProperty.propertyTax) || 0,
            insurance: Number(newProperty.insurance) || 0,
            hoa: Number(newProperty.hoa) || 0,
            maintenance: Number(newProperty.maintenance) || 0,
            vacancy: Number(newProperty.vacancy) || 5
        };

        addProperty(property);
        setProperties(loadProperties());
        setShowForm(false);
        setNewProperty({
            name: '', type: 'sfh', purchasePrice: '', currentValue: '', downPayment: '',
            loanBalance: '', monthlyRent: '', mortgage: '', propertyTax: '',
            insurance: '', hoa: 0, maintenance: '', vacancy: 5
        });
    }, [newProperty]);

    const handleDelete = (id) => {
        deleteProperty(id);
        setProperties(loadProperties());
    };

    // Calculate totals
    const totals = properties.reduce((acc, p) => {
        const cashFlow = calculateMonthlyCashFlow(p);
        const equity = calculateEquity(p);
        return {
            totalValue: acc.totalValue + (p.currentValue || 0),
            totalEquity: acc.totalEquity + equity.currentEquity,
            totalCashFlow: acc.totalCashFlow + cashFlow.netCashFlow,
            totalRent: acc.totalRent + (p.monthlyRent || 0)
        };
    }, { totalValue: 0, totalEquity: 0, totalCashFlow: 0, totalRent: 0 });

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <span className="text-2xl">🏠</span>
                        Real Estate Portfolio
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Track properties and rental income
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary px-3 py-2 text-sm"
                >
                    + Add Property
                </button>
            </div>

            {/* Totals */}
            {properties.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-[var(--color-primary)]/10 rounded-lg p-3 text-center">
                        <p className="text-xs text-[var(--color-text-secondary)]">Total Value</p>
                        <p className="font-bold text-[var(--color-primary)]">
                            {formatCurrency(totals.totalValue)}
                        </p>
                    </div>
                    <div className="bg-[var(--color-success)]/10 rounded-lg p-3 text-center">
                        <p className="text-xs text-[var(--color-text-secondary)]">Total Equity</p>
                        <p className="font-bold text-[var(--color-success)]">
                            {formatCurrency(totals.totalEquity)}
                        </p>
                    </div>
                    <div className="bg-[var(--color-success)]/10 rounded-lg p-3 text-center">
                        <p className="text-xs text-[var(--color-text-secondary)]">Monthly Rent</p>
                        <p className="font-bold text-[var(--color-success)]">
                            {formatCurrency(totals.totalRent)}
                        </p>
                    </div>
                    <div className={`rounded-lg p-3 text-center ${totals.totalCashFlow >= 0 ? 'bg-[var(--color-success)]/10' : 'bg-[var(--color-danger)]/10'}`}>
                        <p className="text-xs text-[var(--color-text-secondary)]">Net Cash Flow</p>
                        <p className={`font-bold ${totals.totalCashFlow >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                            {formatCurrency(totals.totalCashFlow)}/mo
                        </p>
                    </div>
                </div>
            )}

            {/* Add Form */}
            {showForm && (
                <div className="mb-4 p-4 bg-[var(--color-bg-secondary)] rounded-lg animate-fadeIn">
                    <h3 className="font-semibold mb-3">New Property</h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                            type="text"
                            placeholder="Property Name"
                            value={newProperty.name}
                            onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                            className="col-span-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                        />
                        <select
                            value={newProperty.type}
                            onChange={(e) => setNewProperty({ ...newProperty, type: e.target.value })}
                            className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                        >
                            {PROPERTY_TYPES.map(type => (
                                <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                            ))}
                        </select>
                        <input type="number" placeholder="Current Value ($)" value={newProperty.currentValue}
                            onChange={(e) => setNewProperty({ ...newProperty, currentValue: e.target.value })}
                            className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-3 py-2" />
                        <input type="number" placeholder="Purchase Price ($)" value={newProperty.purchasePrice}
                            onChange={(e) => setNewProperty({ ...newProperty, purchasePrice: e.target.value })}
                            className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-3 py-2" />
                        <input type="number" placeholder="Loan Balance ($)" value={newProperty.loanBalance}
                            onChange={(e) => setNewProperty({ ...newProperty, loanBalance: e.target.value })}
                            className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-3 py-2" />
                        <input type="number" placeholder="Monthly Rent ($)" value={newProperty.monthlyRent}
                            onChange={(e) => setNewProperty({ ...newProperty, monthlyRent: e.target.value })}
                            className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-3 py-2" />
                        <input type="number" placeholder="Monthly Mortgage ($)" value={newProperty.mortgage}
                            onChange={(e) => setNewProperty({ ...newProperty, mortgage: e.target.value })}
                            className="bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-3 py-2" />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleAdd} className="btn-primary px-4 py-2 text-sm">Add Property</button>
                        <button onClick={() => setShowForm(false)} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
                    </div>
                </div>
            )}

            {/* Properties List */}
            {properties.length === 0 ? (
                <div className="text-center py-8">
                    <span className="text-4xl mb-2 block">🏠</span>
                    <p className="text-[var(--color-text-secondary)]">No properties yet</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">Add your first investment property</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {properties.map(property => {
                        const typeInfo = PROPERTY_TYPES.find(t => t.id === property.type) || PROPERTY_TYPES[0];
                        const cashFlow = calculateMonthlyCashFlow(property);
                        const equity = calculateEquity(property);
                        const noi = (property.monthlyRent * 12) - (property.propertyTax || 0) - (property.insurance || 0);
                        const capRate = calculateCapRate(noi, property.currentValue);

                        return (
                            <div key={property.id} className="bg-[var(--color-bg-secondary)] rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{typeInfo.icon}</span>
                                        <div>
                                            <p className="font-bold">{property.name}</p>
                                            <p className="text-xs text-[var(--color-text-secondary)]">{typeInfo.name}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(property.id)} className="text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 p-2 rounded">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 gap-2 text-xs">
                                    <div>
                                        <p className="text-[var(--color-text-secondary)]">Value</p>
                                        <p className="font-bold">{formatCurrency(property.currentValue)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[var(--color-text-secondary)]">Equity</p>
                                        <p className="font-bold text-[var(--color-success)]">{formatCurrency(equity.currentEquity)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[var(--color-text-secondary)]">Cash Flow</p>
                                        <p className={`font-bold ${cashFlow.netCashFlow >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                                            {formatCurrency(cashFlow.netCashFlow)}/mo
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[var(--color-text-secondary)]">Cap Rate</p>
                                        <p className="font-bold">{capRate.toFixed(1)}%</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
