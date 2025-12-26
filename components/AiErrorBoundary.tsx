import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BrainIcon } from './icons/BrainIcon';

interface Props {
    children: ReactNode;
    onRetry?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Specialized error boundary for AI components.
 * Provides a more friendly error message and retry functionality.
 */
export class AiErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('AI Error:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
        this.props.onRetry?.();
    };

    public render() {
        if (this.state.hasError) {
            const isRateLimit = this.state.error?.message?.includes('rate limit');
            const isNetwork = this.state.error?.message?.includes('fetch') ||
                this.state.error?.message?.includes('network');

            return (
                <div className="flex flex-col items-center justify-center p-6 bg-slate-800/50 border border-purple-500/30 rounded-lg">
                    <div className="w-16 h-16 mb-4 text-purple-400 opacity-50">
                        <BrainIcon className="w-full h-full" />
                    </div>

                    <h3 className="text-lg font-semibold text-purple-300 mb-2">
                        {isRateLimit ? 'AI Rate Limit Reached' : isNetwork ? 'Connection Issue' : 'AI Service Unavailable'}
                    </h3>

                    <p className="text-sm text-slate-400 text-center mb-4 max-w-md">
                        {isRateLimit
                            ? 'You have reached the hourly limit for AI requests. Please try again later or upgrade your plan.'
                            : isNetwork
                                ? 'Unable to connect to the AI service. Please check your internet connection.'
                                : 'The AI service encountered an error. This is usually temporary.'}
                    </p>

                    {!isRateLimit && (
                        <button
                            onClick={this.handleRetry}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 text-white rounded-md text-sm transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Retry
                        </button>
                    )}

                    {isRateLimit && (
                        <div className="text-xs text-slate-500 mt-2">
                            Limit resets in ~1 hour
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default AiErrorBoundary;
