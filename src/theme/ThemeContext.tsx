import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { StorageService } from '../services/StorageService';
import { createTheme, Theme } from './index';
import { ThemeMode } from '../types';

interface ThemeContextType {
    theme: Theme;
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@parrot_master_theme';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

    // Load saved theme preference
    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const saved = await StorageService.getItem(THEME_STORAGE_KEY);
            if (saved) {
                setThemeModeState(saved as ThemeMode);
            }
        } catch (error) {
            console.error('Failed to load theme preference:', error);
        }
    };

    const setThemeMode = async (mode: ThemeMode) => {
        try {
            await StorageService.setItem(THEME_STORAGE_KEY, mode);
            setThemeModeState(mode);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    // Determine actual theme based on mode
    const isDark = themeMode === 'system'
        ? systemColorScheme === 'dark'
        : themeMode === 'dark';

    const theme = createTheme(isDark);

    return (
        <ThemeContext.Provider value={{ theme, themeMode, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
