console.log('--- DEBUG: App.tsx entry point hit ---');
if (typeof window !== 'undefined') {
    window.__APP_LOADED__ = true;
    console.log('--- DEBUG: Global state set ---');
}

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initDatabase } from './src/database/init';

// --- DEBUG LOGGING ---
console.log('--- DEBUG: App.tsx loaded ---');
if (typeof window !== 'undefined') {
    window.onerror = function (message, source, lineno, colno, error) {
        console.error('--- GLOBAL ERROR ---', { message, source, lineno, colno, error });
        const root = document.getElementById('root');
        if (root) {
            root.innerHTML = `
                <div style="padding: 20px; color: red; font-family: sans-serif;">
                    <h1>Critical Error</h1>
                    <pre>${message}</pre>
                </div>
            `;
        }
        return false;
    };
    window.onunhandledrejection = function (event) {
        console.error('--- UNHANDLED REJECTION ---', event.reason);
    };
}
// --------------------

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#8040BF', marginBottom: 20 }}>🦜 Parrot Master</Text>
                    <Text style={{ fontSize: 18, color: 'red', marginBottom: 10 }}>Something went wrong</Text>
                    <View style={{ backgroundColor: '#f8f8f8', padding: 15, borderRadius: 8, width: '100%' }}>
                        <Text style={{ fontSize: 14, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                            {String(this.state.error)}
                        </Text>
                    </View>
                    <Text style={{ fontSize: 14, color: '#666', marginTop: 20, textAlign: 'center' }}>
                        If you see this on web, try clearing your browser cache or opening in Incognito mode.
                    </Text>
                </View>
            );
        }
        return this.props.children;
    }
}

console.log('Parrot Master: App Initializing');

function AppContent() {
    console.log('--- DEBUG: AppContent executing ---');
    const { theme } = useTheme();
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('AppContent useEffect firing');
        initialize();
    }, []);

    const initialize = async () => {
        try {
            console.log('App initialization starting...');
            // Initialize database only on native platforms
            if (Platform.OS !== 'web') {
                await initDatabase();
            }
            console.log('App initialization complete');
            setIsReady(true);
        } catch (err) {
            console.error('Initialization error:', err);
            setError('Failed to initialize app. Please restart.');
        }
    };

    if (error) {
        return (
            <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.errorText, { color: theme.colors.brand.toxic }]}>
                    {error}
                </Text>
            </View>
        );
    }

    if (!isReady) {
        return (
            <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                    🦜 Parrot Master
                </Text>
                <Text style={[styles.subText, { color: theme.colors.textSecondary }]}>
                    Initializing...
                </Text>
            </View>
        );
    }

    console.log('AppContent rendering RootNavigator', { isReady, hasError: !!error });
    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <StatusBar style={theme.isDark ? 'light' : 'dark'} />
            <RootNavigator />
        </View>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <SafeAreaProvider>
                <ThemeProvider>
                    <AppContent />
                </ThemeProvider>
            </SafeAreaProvider>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    loadingText: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 8,
    },
    subText: {
        fontSize: 16,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
