import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface CardProps {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
    const { theme } = useTheme();

    // Separate background and border styles to allow easy overrides without conflicts
    const baseStyle = {
        backgroundColor: theme.colors.surfaceSolid,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        // CRITICAL: Disable elevation on Android if card is likely semi-transparent
        // as Native Elevation on Android doesn't support transparency/blur well.
        ...(Platform.OS === 'ios' ? theme.shadows.card : {}),
    };

    return (
        <View style={[styles.card, baseStyle, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 16,
    },
});
