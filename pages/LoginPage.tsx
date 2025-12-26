import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { NyxLogo } from '../components/icons/NyxLogo';

interface LoginPageProps {
    onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
    const { login, register, isLoading } = useAuth();
    const { addToast } = useToast();

    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegisterMode) {
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    setLoading(false);
                    return;
                }
                await register(email, password);
                addToast('Account created successfully!', 'success');
            } else {
                await login(email, password);
                addToast('Welcome back!', 'success');
            }
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Authentication failed');
            addToast(err instanceof Error ? err.message : 'Authentication failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0f2b]">
                <div className="animate-pulse">
                    <NyxLogo className="w-24 h-24" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f2b] relative">
            {/* Background gradient */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] pointer-events-none" />

            <div className="w-full max-w-md p-8 bg-slate-900/80 backdrop-blur-sm border border-cyan-400/30 rounded-xl shadow-2xl relative z-10">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <NyxLogo className="w-20 h-20 mb-4" />
                    <h1 className="text-2xl font-bold text-white">NYX</h1>
                    <p className="text-sm text-slate-400">HR Intelligence Platform</p>
                </div>

                {/* Tab switcher */}
                <div className="flex mb-6 bg-slate-800/50 rounded-lg p-1">
                    <button
                        type="button"
                        onClick={() => setIsRegisterMode(false)}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!isRegisterMode
                                ? 'bg-cyan-600/50 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsRegisterMode(true)}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${isRegisterMode
                                ? 'bg-cyan-600/50 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Register
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                            placeholder="you@company.com"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    {isRegisterMode && (
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {isRegisterMode ? 'Creating account...' : 'Signing in...'}
                            </>
                        ) : (
                            isRegisterMode ? 'Create Account' : 'Sign In'
                        )}
                    </button>
                </form>

                {/* Demo credentials hint */}
                <div className="mt-6 p-3 bg-slate-800/30 rounded-lg text-xs text-slate-500 text-center">
                    <p>Demo credentials:</p>
                    <p className="text-cyan-400/70">admin@nyx.ge / admin123</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
