import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Card } from './Card';

interface ProgressCardProps {
    title: string;
    current: number;
    target: number;
    unit?: string;
    color?: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
    title,
    current,
    target,
    unit = '',
    color
}) => {
    const { theme } = useTheme();
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    const progressColor = color || theme.colors.brand.primary;

    return (
        <Card style={styles.container}>
            <View style={styles.header}>
                <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                    {title}
                </Text>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
                    {current}/{target} {unit}
                </Text>
            </View>

            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${percentage}%`,
                            backgroundColor: progressColor
                        }
                    ]}
                />
            </View>

            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, textAlign: 'right' }]}>
                {percentage.toFixed(0)}% complete
            </Text>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressBar: {
        height: 12, // Thicker
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 6,
    },
});
