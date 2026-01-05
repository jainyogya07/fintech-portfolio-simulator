import { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
    loadAlerts,
    createAlert,
    deleteAlert,
    toggleAlert,
    ALERT_TYPES,
    getAlertTypeLabel,
    requestNotificationPermission
} from '../services/alertService';
import { formatCurrency } from '../services/calculations';

export default function AlertCenter() {
    const { holdings } = usePortfolio();
    const [alerts, setAlerts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState('default');

    const [newAlert, setNewAlert] = useState({
        type: ALERT_TYPES.PRICE_ABOVE,
        symbol: '',
        threshold: '',
        message: ''
    });

    useEffect(() => {
        setAlerts(loadAlerts());
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    const handleCreate = useCallback(() => {
        if (!newAlert.threshold) return;

        let message = '';
        if (newAlert.type === ALERT_TYPES.PRICE_ABOVE) {
            message = `${newAlert.symbol} reached $${newAlert.threshold}`;
        } else if (newAlert.type === ALERT_TYPES.PRICE_BELOW) {
            message = `${newAlert.symbol} dropped to $${newAlert.threshold}`;
        } else if (newAlert.type === ALERT_TYPES.PORTFOLIO_DROP) {
            message = `Portfolio dropped ${newAlert.threshold}%`;
        } else if (newAlert.type === ALERT_TYPES.PORTFOLIO_GAIN) {
            message = `Portfolio gained ${newAlert.threshold}%`;
        }

        createAlert({
            ...newAlert,
            threshold: Number(newAlert.threshold),
            message
        });

        setAlerts(loadAlerts());
        setShowForm(false);
        setNewAlert({
            type: ALERT_TYPES.PRICE_ABOVE,
            symbol: holdings[0]?.symbol || '',
            threshold: '',
            message: ''
        });
    }, [newAlert, holdings]);

    const handleDelete = (id) => {
        deleteAlert(id);
        setAlerts(loadAlerts());
    };

    const handleToggle = (id) => {
        toggleAlert(id);
        setAlerts(loadAlerts());
    };

    const enableNotifications = async () => {
        const permission = await requestNotificationPermission();
        setNotificationPermission(permission);
    };

    const isPriceAlert = [ALERT_TYPES.PRICE_ABOVE, ALERT_TYPES.PRICE_BELOW].includes(newAlert.type);

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <span className="text-2xl">🔔</span>
                        Alert Center
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                        Get notified when prices or portfolio changes
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary px-3 py-2 text-sm"
                >
                    + Add Alert
                </button>
            </div>

            {/* Notification Permission */}
            {notificationPermission !== 'granted' && (
                <div className="mb-4 p-3 bg-[var(--color-warning)]/10 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>🔕</span>
                        <span className="text-sm">Enable browser notifications for alerts</span>
                    </div>
                    <button
                        onClick={enableNotifications}
                        className="text-sm px-3 py-1 bg-[var(--color-warning)] text-white rounded"
                    >
                        Enable
                    </button>
                </div>
            )}

            {/* Add Form */}
            {showForm && (
                <div className="mb-6 p-4 bg-[var(--color-bg-secondary)] rounded-lg animate-fadeIn">
                    <h3 className="font-semibold mb-3">New Alert</h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                                Alert Type
                            </label>
                            <select
                                value={newAlert.type}
                                onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                                className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                            >
                                <option value={ALERT_TYPES.PRICE_ABOVE}>Price Above</option>
                                <option value={ALERT_TYPES.PRICE_BELOW}>Price Below</option>
                                <option value={ALERT_TYPES.PORTFOLIO_DROP}>Portfolio Drop %</option>
                                <option value={ALERT_TYPES.PORTFOLIO_GAIN}>Portfolio Gain %</option>
                            </select>
                        </div>

                        {isPriceAlert && (
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                                    Stock Symbol
                                </label>
                                <select
                                    value={newAlert.symbol}
                                    onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
                                    className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                                >
                                    <option value="">Select stock</option>
                                    {holdings.map(h => (
                                        <option key={h.symbol} value={h.symbol}>{h.symbol}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className={isPriceAlert ? '' : 'col-span-2'}>
                            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                                {isPriceAlert ? 'Price Threshold ($)' : 'Percentage (%)'}
                            </label>
                            <input
                                type="number"
                                value={newAlert.threshold}
                                onChange={(e) => setNewAlert({ ...newAlert, threshold: e.target.value })}
                                placeholder={isPriceAlert ? '150.00' : '5'}
                                className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleCreate}
                            disabled={!newAlert.threshold || (isPriceAlert && !newAlert.symbol)}
                            className="btn-primary px-4 py-2 text-sm"
                        >
                            Create Alert
                        </button>
                        <button
                            onClick={() => setShowForm(false)}
                            className="btn-secondary px-4 py-2 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Alert List */}
            {alerts.length === 0 ? (
                <div className="text-center py-8">
                    <span className="text-4xl mb-2 block">🔕</span>
                    <p className="text-[var(--color-text-secondary)]">No alerts set</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        Create alerts to get notified of price changes
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {alerts.map(alert => (
                        <div
                            key={alert.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${alert.triggered
                                    ? 'bg-[var(--color-success)]/10 border border-[var(--color-success)]/30'
                                    : 'bg-[var(--color-bg-secondary)]'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleToggle(alert.id)}
                                    className={`w-8 h-5 rounded-full relative transition-colors ${alert.enabled ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
                                        }`}
                                >
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${alert.enabled ? 'left-3.5' : 'left-0.5'
                                        }`} />
                                </button>
                                <div>
                                    <p className="font-medium text-sm">
                                        {alert.symbol && <span className="text-[var(--color-primary)]">{alert.symbol}: </span>}
                                        {getAlertTypeLabel(alert.type)}
                                        {alert.symbol ? ` $${alert.threshold}` : ` ${alert.threshold}%`}
                                    </p>
                                    {alert.triggered && (
                                        <p className="text-xs text-[var(--color-success)]">
                                            ✓ Triggered {new Date(alert.triggeredAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(alert.id)}
                                className="text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 p-2 rounded"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
