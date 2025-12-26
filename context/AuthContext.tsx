import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient, User as SupabaseUser } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check active session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setToken(session.access_token);
                syncUser(session.user);
            } else {
                setIsLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setToken(session.access_token);
                syncUser(session.user);
            } else {
                setToken(null);
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const syncUser = async (sbUser: SupabaseUser) => {
        try {
            // Check if user exists in our DB, if not, they might need to be synced
            // For now, we'll just map the Supabase user to our internal User type
            // The 'role' is usually stored in app_metadata in Supabase
            const role = (sbUser.app_metadata?.role as any) || 'EMPLOYEE';

            setUser({
                id: sbUser.id,
                email: sbUser.email || '',
                role: role,
            });
        } catch (error) {
            console.error('Failed to sync user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        if (!data.session) throw new Error('Login successful but no session returned');

        setToken(data.session.access_token);
        syncUser(data.user);
    };

    const register = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) throw error;
        if (!data.user) throw new Error('Registration failed');

        // If auto-confirm is on, we'll have a session
        if (data.session) {
            setToken(data.session.access_token);
            syncUser(data.user);
        } else {
            // Handle case where email verification is required
            alert('Please check your email for the confirmation link!');
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
