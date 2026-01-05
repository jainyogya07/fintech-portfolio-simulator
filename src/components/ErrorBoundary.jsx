import React from 'react';

/**
 * Error Boundary Component
 * Catches JavaScript errors in child component tree and displays fallback UI
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so next render shows fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console (could send to error tracking service)
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-bg-primary)]">
                    <div className="glass-card p-8 max-w-md text-center animate-fadeIn">
                        <div className="text-6xl mb-6">💥</div>
                        <h1 className="text-2xl font-bold mb-4 text-[var(--color-danger)]">
                            Something Went Wrong
                        </h1>
                        <p className="text-[var(--color-text-secondary)] mb-6">
                            We encountered an unexpected error. Your data is safe —
                            try refreshing or click below to retry.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mb-6 text-left bg-[var(--color-bg-secondary)] p-4 rounded-lg">
                                <summary className="cursor-pointer text-sm font-medium text-[var(--color-danger)]">
                                    Error Details (Dev Only)
                                </summary>
                                <pre className="mt-2 text-xs overflow-auto text-[var(--color-text-secondary)]">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="btn-primary"
                            >
                                🔄 Try Again
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-[var(--color-bg-secondary)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
                            >
                                ↻ Refresh Page
                            </button>
                        </div>

                        <p className="text-xs text-[var(--color-text-secondary)] mt-6">
                            If this keeps happening, try clearing your browser cache.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
