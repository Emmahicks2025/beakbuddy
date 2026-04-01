import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { FoodVerdict } from '../types';

interface FoodVerdictBadgeProps {
    verdict: FoodVerdict;
    confidence: number;
}

export const FoodVerdictBadge: React.FC<FoodVerdictBadgeProps> = ({
    verdict,
    confidence,
}) => {
    const { theme } = useTheme();

    const getColor = () => {
        const colors = theme.colors.brand;
        switch (verdict) {
            case 'SAFE':
                return colors?.safe || '#10B981';
            case 'TOXIC':
                return colors?.toxic || '#EF4444';
            case 'UNKNOWN':
                return colors?.coral || '#FF6B6B';
            default:
                return '#94A3B8'; // Gray fallback
        }
    };

    const getLabel = () => {
        const confidencePercent = Math.round(confidence * 100);
        return `${verdict} (${confidencePercent}%)`;
    };

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: getColor(),
                    borderRadius: theme.borderRadius.md,
                },
            ]}
        >
            <Text style={[styles.text, theme.typography.bodySmall]}>
                {getLabel()}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignSelf: 'flex-start',
    },
    text: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
