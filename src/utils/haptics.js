/**
 * Haptic Feedback Utility
 * Provides tactile feedback on supported devices
 */

/**
 * Check if vibration API is supported
 */
export function isHapticsSupported() {
    return 'vibrate' in navigator;
}

/**
 * Light haptic - for button taps
 */
export function hapticLight() {
    if (isHapticsSupported()) {
        navigator.vibrate(10);
    }
}

/**
 * Medium haptic - for selections
 */
export function hapticMedium() {
    if (isHapticsSupported()) {
        navigator.vibrate(25);
    }
}

/**
 * Heavy haptic - for confirmations
 */
export function hapticHeavy() {
    if (isHapticsSupported()) {
        navigator.vibrate(50);
    }
}

/**
 * Success haptic - double pulse
 */
export function hapticSuccess() {
    if (isHapticsSupported()) {
        navigator.vibrate([20, 50, 20]);
    }
}

/**
 * Error haptic - triple pulse
 */
export function hapticError() {
    if (isHapticsSupported()) {
        navigator.vibrate([30, 30, 30, 30, 50]);
    }
}

/**
 * Selection change haptic
 */
export function hapticSelection() {
    if (isHapticsSupported()) {
        navigator.vibrate(5);
    }
}
