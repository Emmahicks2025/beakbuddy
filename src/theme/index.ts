import { Platform } from 'react-native';

// Theme system with Light/Dark/System modes

export const colors = {
    // Brand colors - More vibrant for Liquid Glass
    primary: '#8B5CF6', // Vibrant Violet
    brandPurple: '#8B5CF6',
    coral: '#FF6B6B',
    safe: '#10B981', // Emerald
    toxic: '#EF4444', // Red 500
    accent: '#3B82F6', // Blue 500

    // Light theme - Glass Base
    light: {
        background: '#F8FAFC',
        surface: 'rgba(255, 255, 255, 0.7)', // Glassy
        surfaceSolid: '#FFFFFF',
        text: '#0F172A',
        textSecondary: '#64748B',
        border: 'rgba(203, 213, 225, 0.5)',
        glassBorder: 'rgba(255, 255, 255, 0.8)',
        shadow: 'rgba(15, 23, 42, 0.08)',
        shadowDark: 'rgba(15, 23, 42, 0.12)',
        highlight: 'rgba(255, 255, 255, 1)',
    },

    // Dark theme - Glass Base
    dark: {
        background: '#0F172A',
        surface: 'rgba(30, 41, 59, 0.7)', // Glassy
        surfaceSolid: '#1E293B',
        text: '#F8FAFC',
        textSecondary: '#94A3B8',
        border: 'rgba(255, 255, 255, 0.1)',
        glassBorder: 'rgba(255, 255, 255, 0.15)',
        shadow: 'rgba(0, 0, 0, 0.3)',
        shadowDark: 'rgba(0, 0, 0, 0.5)',
        highlight: 'rgba(255, 255, 255, 0.05)',
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 12, // Increased for softer look
    md: 20,
    lg: 28,
    xl: 36,
    pill: 999,
    circle: 9999,
};

export const typography = {
    h1: {
        fontSize: 34, // iOS Large Title
        fontWeight: '700' as const,
        lineHeight: 41,
        letterSpacing: -0.4,
    },
    h2: {
        fontSize: 28,
        fontWeight: '700' as const,
        lineHeight: 34,
        letterSpacing: -0.4,
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        lineHeight: 25,
        letterSpacing: -0.4,
    },
    body: {
        fontSize: 17, // iOS Body
        fontWeight: '400' as const,
        lineHeight: Platform.select({ ios: 22, android: 24 }),
    },
    bodySmall: {
        fontSize: 15, // iOS Footnote/Subhead
        fontWeight: '400' as const,
        lineHeight: Platform.select({ ios: 20, android: 22 }),
    },
    caption: {
        fontSize: 13,
        fontWeight: '400' as const,
        lineHeight: 18,
    },
    button: {
        fontSize: 17,
        fontWeight: '600' as const,
        lineHeight: 22,
    },
};

export const touchTarget = {
    min: 44,
};

export const shadows = {
    glass: {
        light: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 4,
        },
        dark: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 8,
        },
    },
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
};

export type Theme = {
    colors: typeof colors.light & { brand: typeof colors };
    spacing: typeof spacing;
    borderRadius: typeof borderRadius;
    typography: typeof typography;
    touchTarget: typeof touchTarget;
    shadows: typeof shadows;
    isDark: boolean;
};

export const createTheme = (isDark: boolean): Theme => ({
    colors: {
        ...(isDark ? colors.dark : colors.light),
        brand: colors,
    },
    spacing,
    borderRadius,
    typography,
    touchTarget,
    shadows,
    isDark,
});
