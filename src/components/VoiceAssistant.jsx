import { useState, useEffect, useCallback, useRef } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import {
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported,
    createSpeechRecognition,
    speak,
    stopSpeaking,
    parseVoiceCommand,
    generateResponse,
    VOICE_COMMANDS
} from '../services/voiceService';

export default function VoiceAssistant() {
    const { holdings, totalValue } = usePortfolio();

    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState(null);
    const [showCommands, setShowCommands] = useState(false);

    const recognitionRef = useRef(null);

    const isSupported = isSpeechRecognitionSupported();
    const canSpeak = isSpeechSynthesisSupported();

    // Calculate portfolio data for responses
    const portfolioData = {
        totalValue: totalValue || 0,
        totalGain: holdings.reduce((sum, h) => sum + ((h.currentPrice - h.purchasePrice) * h.shares), 0),
        holdings,
        sharpe: 1.2 // Placeholder
    };

    const handleResult = useCallback((text) => {
        setTranscript(text);

        const command = parseVoiceCommand(text);
        if (command) {
            const responseText = generateResponse(command.action, portfolioData);
            setResponse(responseText);

            if (canSpeak) {
                setIsSpeaking(true);
                speak(responseText, () => setIsSpeaking(false));
            }
        } else {
            const fallback = "I didn't quite catch that. Try asking about your portfolio value or gains.";
            setResponse(fallback);
            if (canSpeak) {
                setIsSpeaking(true);
                speak(fallback, () => setIsSpeaking(false));
            }
        }
    }, [portfolioData, canSpeak]);

    const handleError = useCallback((err) => {
        setError(`Error: ${err}`);
        setIsListening(false);
    }, []);

    const handleEnd = useCallback(() => {
        setIsListening(false);
    }, []);

    const startListening = useCallback(() => {
        if (!isSupported) {
            setError('Speech recognition not supported in your browser');
            return;
        }

        setError(null);
        setTranscript('');
        setResponse('');

        recognitionRef.current = createSpeechRecognition(handleResult, handleError, handleEnd);

        if (recognitionRef.current) {
            recognitionRef.current.start();
            setIsListening(true);
        }
    }, [isSupported, handleResult, handleError, handleEnd]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    }, []);

    const handleStop = useCallback(() => {
        stopSpeaking();
        setIsSpeaking(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            stopSpeaking();
        };
    }, []);

    return (
        <div className="glass-card p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">🎤</span>
                Voice Assistant
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Ask questions about your portfolio using your voice
            </p>

            {/* Main Button */}
            <div className="flex flex-col items-center mb-6">
                <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={!isSupported}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isListening
                        ? 'bg-[var(--color-danger)] animate-pulse'
                        : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80'
                        }`}
                >
                    {isListening ? (
                        <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                    ) : (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    )}
                </button>
                <p className="text-sm text-[var(--color-text-secondary)] mt-3">
                    {isListening ? 'Listening... Speak now!' : 'Tap to speak'}
                </p>
            </div>

            {/* Transcript & Response */}
            {(transcript || response) && (
                <div className="space-y-3 mb-4">
                    {transcript && (
                        <div className="p-3 bg-[var(--color-bg-secondary)] rounded-lg">
                            <p className="text-xs text-[var(--color-text-secondary)] mb-1">You said:</p>
                            <p className="text-sm italic">"{transcript}"</p>
                        </div>
                    )}
                    {response && (
                        <div className="p-3 bg-[var(--color-primary)]/10 rounded-lg flex items-start gap-2">
                            <span className="text-xl">🤖</span>
                            <div>
                                <p className="text-sm">{response}</p>
                                {isSpeaking && (
                                    <button
                                        onClick={handleStop}
                                        className="text-xs text-[var(--color-danger)] mt-1 hover:underline"
                                    >
                                        Stop speaking
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="p-3 bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 rounded-lg text-sm mb-4">
                    <div className="flex items-start gap-2">
                        <span className="text-lg">🎤</span>
                        <div>
                            {error.includes('not-allowed') ? (
                                <>
                                    <p className="font-semibold text-[var(--color-warning)]">Microphone Access Needed</p>
                                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                        Tap the 🔒 in your browser's address bar → Allow microphone → Try again
                                    </p>
                                </>
                            ) : (
                                <p className="text-[var(--color-danger)]">{error}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Commands */}
            <div>
                <button
                    onClick={() => setShowCommands(!showCommands)}
                    className="w-full flex items-center justify-between text-sm font-semibold p-2 bg-[var(--color-bg-secondary)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
                >
                    <span>💡 Available Commands</span>
                    <svg className={`w-4 h-4 transition-transform ${showCommands ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {showCommands && (
                    <div className="mt-2 space-y-1 animate-fadeIn">
                        {VOICE_COMMANDS.map((cmd, index) => (
                            <div key={index} className="flex items-center justify-between text-xs p-2 bg-[var(--color-bg-secondary)] rounded">
                                <span>{cmd.description}</span>
                                <span className="text-[var(--color-text-secondary)]">"{cmd.patterns[0]}"</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Browser Support Note */}
            {!isSupported && (
                <div className="mt-4 p-3 bg-[var(--color-warning)]/10 rounded-lg text-xs">
                    <strong>⚠️ Not Supported:</strong> Speech recognition requires Chrome, Edge, or Safari.
                </div>
            )}
        </div>
    );
}
