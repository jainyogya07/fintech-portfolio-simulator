/**
 * Voice Service
 * Speech recognition and synthesis for voice interface
 */

/**
 * Check if speech recognition is supported
 */
export function isSpeechRecognitionSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

/**
 * Check if speech synthesis is supported
 */
export function isSpeechSynthesisSupported() {
    return 'speechSynthesis' in window;
}

/**
 * Create speech recognition instance
 */
export function createSpeechRecognition(onResult, onError, onEnd) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        onResult(transcript);
    };

    recognition.onerror = (event) => {
        onError(event.error);
    };

    recognition.onend = () => {
        onEnd();
    };

    return recognition;
}

/**
 * Speak text aloud
 */
export function speak(text, onEnd = () => { }) {
    if (!isSpeechSynthesisSupported()) {
        onEnd();
        return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = onEnd;

    window.speechSynthesis.speak(utterance);
}

/**
 * Stop speaking
 */
export function stopSpeaking() {
    if (isSpeechSynthesisSupported()) {
        window.speechSynthesis.cancel();
    }
}

/**
 * Voice commands and handlers
 */
export const VOICE_COMMANDS = [
    {
        patterns: ['portfolio value', 'total value', 'how much', 'worth'],
        action: 'GET_VALUE',
        description: 'Get portfolio total value'
    },
    {
        patterns: ['gain', 'profit', 'return'],
        action: 'GET_GAIN',
        description: 'Get portfolio gains'
    },
    {
        patterns: ['risk', 'sharpe', 'volatility'],
        action: 'GET_RISK',
        description: 'Get risk metrics'
    },
    {
        patterns: ['holdings', 'stocks', 'positions'],
        action: 'GET_HOLDINGS',
        description: 'List holdings'
    },
    {
        patterns: ['help', 'commands', 'what can you'],
        action: 'GET_HELP',
        description: 'Get available commands'
    }
];

/**
 * Parse voice command
 */
export function parseVoiceCommand(transcript) {
    for (const command of VOICE_COMMANDS) {
        for (const pattern of command.patterns) {
            if (transcript.includes(pattern)) {
                return command;
            }
        }
    }
    return null;
}

/**
 * Generate response for command
 */
export function generateResponse(action, portfolioData) {
    const { totalValue = 0, totalGain = 0, holdings = [], sharpe = 0 } = portfolioData;

    switch (action) {
        case 'GET_VALUE':
            return `Your portfolio is worth ${formatNumber(totalValue)} dollars.`;

        case 'GET_GAIN':
            const gainText = totalGain >= 0 ? `up ${formatNumber(Math.abs(totalGain))}` : `down ${formatNumber(Math.abs(totalGain))}`;
            return `Your portfolio is ${gainText} dollars.`;

        case 'GET_RISK':
            return `Your Sharpe ratio is ${sharpe.toFixed(2)}. A higher number means better risk-adjusted returns.`;

        case 'GET_HOLDINGS':
            if (holdings.length === 0) {
                return 'You have no holdings in your portfolio.';
            }
            const holdingsList = holdings.slice(0, 5).map(h => h.symbol).join(', ');
            return `You have ${holdings.length} holdings including ${holdingsList}.`;

        case 'GET_HELP':
            return 'You can ask me about your portfolio value, gains, risk metrics, or list your holdings. Just speak naturally!';

        default:
            return "I didn't understand that. Try asking about your portfolio value, gains, or risk.";
    }
}

function formatNumber(num) {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(2)} million`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)} thousand`;
    }
    return num.toFixed(2);
}
