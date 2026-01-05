/**
 * Alert Service
 * Manage portfolio alerts and notifications
 */

const ALERT_STORAGE_KEY = 'portfolio-alerts';

/**
 * Alert types
 */
export const ALERT_TYPES = {
    PRICE_ABOVE: 'price_above',
    PRICE_BELOW: 'price_below',
    PORTFOLIO_DROP: 'portfolio_drop',
    PORTFOLIO_GAIN: 'portfolio_gain',
    GOAL_PROGRESS: 'goal_progress'
};

/**
 * Load alerts from storage
 */
export function loadAlerts() {
    try {
        const saved = localStorage.getItem(ALERT_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

/**
 * Save alerts to storage
 */
export function saveAlerts(alerts) {
    localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(alerts));
}

/**
 * Create a new alert
 */
export function createAlert({
    type,
    symbol = null,
    threshold,
    message,
    enabled = true
}) {
    const alert = {
        id: Date.now(),
        type,
        symbol,
        threshold,
        message,
        enabled,
        createdAt: new Date().toISOString(),
        triggered: false,
        triggeredAt: null
    };

    const alerts = loadAlerts();
    alerts.push(alert);
    saveAlerts(alerts);

    return alert;
}

/**
 * Delete an alert
 */
export function deleteAlert(alertId) {
    const alerts = loadAlerts().filter(a => a.id !== alertId);
    saveAlerts(alerts);
}

/**
 * Toggle alert enabled state
 */
export function toggleAlert(alertId) {
    const alerts = loadAlerts().map(a =>
        a.id === alertId ? { ...a, enabled: !a.enabled } : a
    );
    saveAlerts(alerts);
}

/**
 * Check alerts against current data
 */
export function checkAlerts(holdings, totalValue, prevTotalValue) {
    const alerts = loadAlerts();
    const triggered = [];

    alerts.forEach(alert => {
        if (!alert.enabled || alert.triggered) return;

        let shouldTrigger = false;

        switch (alert.type) {
            case ALERT_TYPES.PRICE_ABOVE:
                const holdingAbove = holdings.find(h => h.symbol === alert.symbol);
                if (holdingAbove && holdingAbove.currentPrice >= alert.threshold) {
                    shouldTrigger = true;
                }
                break;

            case ALERT_TYPES.PRICE_BELOW:
                const holdingBelow = holdings.find(h => h.symbol === alert.symbol);
                if (holdingBelow && holdingBelow.currentPrice <= alert.threshold) {
                    shouldTrigger = true;
                }
                break;

            case ALERT_TYPES.PORTFOLIO_DROP:
                if (prevTotalValue > 0) {
                    const dropPercent = ((prevTotalValue - totalValue) / prevTotalValue) * 100;
                    if (dropPercent >= alert.threshold) {
                        shouldTrigger = true;
                    }
                }
                break;

            case ALERT_TYPES.PORTFOLIO_GAIN:
                if (prevTotalValue > 0) {
                    const gainPercent = ((totalValue - prevTotalValue) / prevTotalValue) * 100;
                    if (gainPercent >= alert.threshold) {
                        shouldTrigger = true;
                    }
                }
                break;
        }

        if (shouldTrigger) {
            triggered.push({
                ...alert,
                triggered: true,
                triggeredAt: new Date().toISOString()
            });
        }
    });

    // Update triggered alerts in storage
    if (triggered.length > 0) {
        const updatedAlerts = alerts.map(a => {
            const trig = triggered.find(t => t.id === a.id);
            return trig || a;
        });
        saveAlerts(updatedAlerts);
    }

    return triggered;
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        return 'unsupported';
    }

    if (Notification.permission === 'granted') {
        return 'granted';
    }

    const permission = await Notification.requestPermission();
    return permission;
}

/**
 * Send browser notification
 */
export function sendNotification(title, body, icon = '📊') {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'portfolio-alert'
        });
    }
}

/**
 * Get alert type label
 */
export function getAlertTypeLabel(type) {
    const labels = {
        [ALERT_TYPES.PRICE_ABOVE]: 'Price Above',
        [ALERT_TYPES.PRICE_BELOW]: 'Price Below',
        [ALERT_TYPES.PORTFOLIO_DROP]: 'Portfolio Drop',
        [ALERT_TYPES.PORTFOLIO_GAIN]: 'Portfolio Gain',
        [ALERT_TYPES.GOAL_PROGRESS]: 'Goal Progress'
    };
    return labels[type] || type;
}
