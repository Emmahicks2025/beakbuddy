import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { StorageService } from '../services/StorageService';
import { useTheme } from '../theme/ThemeContext';
import { AppMode } from '../types';

// Import navigators
import { OwnerNavigator } from './OwnerNavigator';
import StartScreen from '../screens/StartScreen';

const Stack = createNativeStackNavigator();

const APP_MODE_KEY = '@parrot_master_app_mode';

import { useAuth } from '../context/AuthContext';

export const RootNavigator: React.FC = () => {
    console.log('RootNavigator: Mounting');
    const { theme } = useTheme();
    const { user, loading: authLoading, logout } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('RootNavigator: Auth State Updated', {
            hasUser: !!user,
            authLoading,
            uid: user?.uid
        });
        if (!authLoading) {
            setIsLoading(false);
            // Final safety: Hide splash screen if it's still showing
            SplashScreen.hideAsync().catch(() => { });
        }
    }, [authLoading, user]);

    if (isLoading || authLoading) {
        // Return a view with splash background color to prevent flickering
        return <View style={{ flex: 1, backgroundColor: '#8040BF' }} />;
    }

    const linking = {
        prefixes: [],
        config: {
            screens: {
                Start: '',
                OwnerMode: 'owner',
            },
        },
    };

    // Map our theme to React Navigation Theme
    const navigationTheme = {
        ...(theme.isDark ? DarkTheme : DefaultTheme),
        colors: {
            ...(theme.isDark ? DarkTheme.colors : DefaultTheme.colors),
            background: theme.colors.background,
            card: theme.colors.surfaceSolid, // Headers background
            text: theme.colors.text,
            border: theme.colors.border,
            primary: theme.colors.primary,
        },
    };

    return (
        <NavigationContainer linking={linking} theme={navigationTheme}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: theme.colors.background },
                }}
            >
                {user ? (
                    <Stack.Screen name="OwnerMode">
                        {(props) => <OwnerNavigator {...props} onBackToStart={logout} />}
                    </Stack.Screen>
                ) : (
                    <Stack.Screen name="Start" component={StartScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
