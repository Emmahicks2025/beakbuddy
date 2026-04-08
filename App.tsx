import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { ProfileProvider } from './src/context/ProfileContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initDatabase } from './src/database/init';
import { ProfileRepository } from './src/database/repository';
import SubscriptionService from './src/services/subscriptionService';
import { AuthProvider } from './src/context/AuthContext';
import { CustomSplashScreen } from './src/components/CustomSplashScreen';
import { initRemoteConfig } from './src/services/remoteConfig';

// Import global CSS for web platform
if (Platform.OS === 'web') {
    require('./global.css');
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
    /* reloading app might cause this to fail, ignore */
});

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any, componentStack: string }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null, componentStack: '' };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error('ErrorBoundary caught:', error, errorInfo);
        this.setState({ componentStack: errorInfo?.componentStack || 'No stack' });
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#0F172A' }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#8B5CF6', marginBottom: 20 }}>🦜 BeakBuddy</Text>
                    <Text style={{ fontSize: 18, color: '#EF4444', marginBottom: 10 }}>Something went wrong</Text>
                    <View style={{ backgroundColor: '#1E293B', padding: 15, borderRadius: 12, width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 10 }}>
                        <Text style={{ fontSize: 13, color: '#F8FAFC', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                            {String(this.state.error)}
                        </Text>
                    </View>
                    <View style={{ backgroundColor: '#0F2137', padding: 15, borderRadius: 12, width: '100%', borderWidth: 1, borderColor: 'rgba(255,100,100,0.2)' }}>
                        <Text style={{ fontSize: 10, color: '#94A3B8', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                            {String(this.state.componentStack)}
                        </Text>
                    </View>
                </View>
            );
        }
        return this.props.children;
    }
}

function AppContent() {
    const { theme } = useTheme();
    const [isReady, setIsReady] = useState(false);
    const [showCustomSplash, setShowCustomSplash] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [initialProfiles, setInitialProfiles] = useState<any[]>([]);

    useEffect(() => {
        initialize();
        // Safety 1: Force isReady if taking too long
        const readyTimeout = setTimeout(() => {
            if (!isReady) {
                console.warn('⚠️ Initialization safety timeout reached. Forcing ready...');
                setIsReady(true);
            }
        }, 12000);

        // Safety 2: Hide native splash after 10s no matter what
        const splashTimeout = setTimeout(() => {
            SplashScreen.hideAsync().catch(() => { });
        }, 10000);

        return () => {
            clearTimeout(readyTimeout);
            clearTimeout(splashTimeout);
        };
    }, []);

    const initialize = async () => {
        try {
            // console.log('🚀 App Initialization Starting...');

            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Initialization Timeout')), 10000)
            );

            // Wrap critical services in a race
            const servicesInit = async () => {
                const promises: Promise<any>[] = [];
                // console.log('🔄 Starting Subscription Service...');
                promises.push(SubscriptionService.initialize());
                // Fetch live Gemini API key from Firebase Remote Config
                promises.push(initRemoteConfig());

                if (Platform.OS !== 'web') {
                    // console.log('🔄 Starting Database Service...');
                    promises.push(initDatabase());
                }

                await Promise.all(promises);
                // console.log('✅ All critical services initialized');

                if (Platform.OS !== 'web') {
                    const profiles = await ProfileRepository.getAll();
                    setInitialProfiles(profiles);
                }
            };

            await Promise.race([servicesInit(), timeoutPromise]);

            setIsReady(true);
            // console.log('🎉 App fully initialized');
        } catch (err) {
            console.error('Initialization error:', err);
            // Non-critical: Proceed if it's a timeout or a known manageable error
            console.warn('Initialization issue, proceeding with limited functionality');
            setIsReady(true);
        }
    };

    // Show custom splash screen
    if (showCustomSplash) {
        return <CustomSplashScreen isReady={isReady} onFinish={() => setShowCustomSplash(false)} />;
    }

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
        // Return null so the Splash Screen remains visible
        return null;
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#050814' }}>
            <StatusBar style={theme.isDark ? 'light' : 'dark'} />
            <ProfileProvider initialProfiles={initialProfiles}>
                <RootNavigator />
            </ProfileProvider>
        </View>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <SafeAreaProvider>
                <ThemeProvider>
                    <AuthProvider>
                        <AppContent />
                    </AuthProvider>
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
