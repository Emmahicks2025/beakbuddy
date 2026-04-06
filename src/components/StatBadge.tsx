import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface StatBadgeProps {
    icon: string;
    value: string | number;
    label: string;
    color?: string;
    style?: any;
}

export const StatBadge: React.FC<StatBadgeProps> = ({ icon, value, label, color, style }) => {
    const { theme } = useTheme();
    const badgeColor = color || theme.colors.brand.primary;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.surface }, style]}>
            <View style={[styles.iconCircle, { backgroundColor: badgeColor + '20' }]}>
                <Text style={styles.icon}>{icon}</Text>
            </View>
            <Text style={[theme.typography.h2, { color: theme.colors.text, marginTop: 8 }]}>
                {value}
            </Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                {label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        minHeight: 120,
        justifyContent: 'center',
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 24,
    },
});
