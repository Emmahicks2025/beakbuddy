import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Svg, { Circle, G } from 'react-native-svg';

interface DietPieChartProps {
    pelletsPercent: number;
    veggiesPercent: number;
    fruitsPercent: number;
    seedsPercent: number;
}

export const DietPieChart: React.FC<DietPieChartProps> = ({
    pelletsPercent,
    veggiesPercent,
    fruitsPercent,
    seedsPercent
}) => {
    const { theme } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const size = 220;
    const strokeWidth = 40;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const colors = {
        pellets: '#8040BF',
        veggies: '#00C853',
        fruits: '#FF6B6B',
        seeds: '#FFB74D'
    };

    const suggestions = {
        pellets: 'High-quality formulated pellets should make up the majority of the diet. Look for organic brands without artificial colors.',
        veggies: 'Safe options: Broccoli, Carrots, Kale, Peppers, Sweet Potato (cooked), Spinach, Squash.',
        fruits: 'Treats only! Apple (no seeds), Berries, Banana, Mango, Papaya. High in sugar.',
        seeds: 'Use sparingly as training treats. Sunflower seeds are high in fat. Safflower is better.'
    };

    const createSegment = (percent: number, offset: number) => {
        const segmentLength = (percent / 100) * circumference;
        return {
            strokeDasharray: `${segmentLength} ${circumference}`,
            strokeDashoffset: -offset
        };
    };

    let currentOffset = 0;
    const pelletsSegment = createSegment(pelletsPercent, currentOffset);
    currentOffset += (pelletsPercent / 100) * circumference;

    const veggiesSegment = createSegment(veggiesPercent, currentOffset);
    currentOffset += (veggiesPercent / 100) * circumference;

    const fruitsSegment = createSegment(fruitsPercent, currentOffset);
    currentOffset += (fruitsPercent / 100) * circumference;

    const seedsSegment = createSegment(seedsPercent, currentOffset);

    return (
        <View style={styles.container}>
            <View style={styles.chartRow}>
                <Svg width={size} height={size}>
                    <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={colors.pellets}
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeDasharray={pelletsSegment.strokeDasharray}
                            strokeDashoffset={pelletsSegment.strokeDashoffset}
                            onPress={() => setSelectedCategory('pellets')}
                        />
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={colors.veggies}
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeDasharray={veggiesSegment.strokeDasharray}
                            strokeDashoffset={veggiesSegment.strokeDashoffset}
                            onPress={() => setSelectedCategory('veggies')}
                        />
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={colors.fruits}
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeDasharray={fruitsSegment.strokeDasharray}
                            strokeDashoffset={fruitsSegment.strokeDashoffset}
                            onPress={() => setSelectedCategory('fruits')}
                        />
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={colors.seeds}
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeDasharray={seedsSegment.strokeDasharray}
                            strokeDashoffset={seedsSegment.strokeDashoffset}
                            onPress={() => setSelectedCategory('seeds')}
                        />
                    </G>
                    {/* Inner Text Overlay */}
                    <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                            {selectedCategory ?
                                `${selectedCategory === 'pellets' ? pelletsPercent :
                                    selectedCategory === 'veggies' ? veggiesPercent :
                                        selectedCategory === 'fruits' ? fruitsPercent : seedsPercent}%`
                                : 'Daily'}
                        </Text>
                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                            {selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'Target'}
                        </Text>
                    </View>
                </Svg>
            </View>

            <View style={styles.legend}>
                {(['pellets', 'veggies', 'fruits', 'seeds'] as const).map(cat => (
                    <TouchableOpacity
                        key={cat}
                        style={[
                            styles.legendItem,
                            selectedCategory === cat && { backgroundColor: theme.colors.surface, borderRadius: 8 }
                        ]}
                        onPress={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                    >
                        <View style={[styles.legendDot, { backgroundColor: colors[cat] }]} />
                        <Text style={[theme.typography.bodySmall, { color: theme.colors.text, flex: 1 }]}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)} ({cat === 'pellets' ? pelletsPercent : cat === 'veggies' ? veggiesPercent : cat === 'fruits' ? fruitsPercent : seedsPercent}%)
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {selectedCategory && (
                <View style={[styles.suggestionBox, { backgroundColor: colors[selectedCategory as keyof typeof colors] + '20', borderColor: colors[selectedCategory as keyof typeof colors] }]}>
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.text }]}>
                        💡 {suggestions[selectedCategory as keyof typeof suggestions]}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 16,
    },
    chartRow: {
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    legend: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        marginBottom: 8,
        padding: 4,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    suggestionBox: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        width: '100%',
    },
});
