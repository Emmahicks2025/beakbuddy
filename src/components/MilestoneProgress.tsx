import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Card } from './Card';
import { Milestone } from '../utils/trainingTemplates';

interface MilestoneProgressProps {
    milestones: Milestone[];
    currentWeek: number;
}

export const MilestoneProgress: React.FC<MilestoneProgressProps> = ({ milestones, currentWeek }) => {
    const { theme } = useTheme();

    return (
        <Card style={styles.container}>
            <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 16 }]}>
                🎯 Milestone Progress
            </Text>

            <View style={styles.timeline}>
                {milestones.map((milestone, index) => {
                    const isCompleted = currentWeek > milestone.week;
                    const isCurrent = currentWeek === milestone.week;
                    const isUpcoming = currentWeek < milestone.week;

                    return (
                        <View key={index} style={styles.milestoneItem}>
                            <View style={styles.milestoneLeft}>
                                <View
                                    style={[
                                        styles.milestoneCircle,
                                        {
                                            backgroundColor: isCompleted
                                                ? theme.colors.brand.safe
                                                : isCurrent
                                                    ? theme.colors.brand.primary
                                                    : theme.colors.border
                                        }
                                    ]}
                                >
                                    {isCompleted && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                    {isCurrent && (
                                        <View style={styles.currentDot} />
                                    )}
                                </View>
                                {index < milestones.length - 1 && (
                                    <View
                                        style={[
                                            styles.connector,
                                            {
                                                backgroundColor: isCompleted
                                                    ? theme.colors.brand.safe
                                                    : theme.colors.border
                                            }
                                        ]}
                                    />
                                )}
                            </View>

                            <View style={[styles.milestoneContent, { opacity: isUpcoming ? 0.5 : 1 }]}>
                                <View style={styles.milestoneHeader}>
                                    <View
                                        style={[
                                            styles.weekBadge,
                                            {
                                                backgroundColor: isCompleted
                                                    ? theme.colors.brand.safe + '20'
                                                    : isCurrent
                                                        ? theme.colors.brand.primary + '20'
                                                        : theme.colors.surface
                                            }
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                theme.typography.caption,
                                                {
                                                    color: isCompleted
                                                        ? theme.colors.brand.safe
                                                        : isCurrent
                                                            ? theme.colors.brand.primary
                                                            : theme.colors.textSecondary,
                                                    fontWeight: '600'
                                                }
                                            ]}
                                        >
                                            Week {milestone.week}
                                        </Text>
                                    </View>
                                    {isCurrent && (
                                        <View style={[styles.currentBadge, { backgroundColor: theme.colors.brand.primary }]}>
                                            <Text style={[theme.typography.caption, { color: '#FFFFFF', fontWeight: '600' }]}>
                                                Current
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Text
                                    style={[
                                        theme.typography.body,
                                        {
                                            color: theme.colors.text,
                                            fontWeight: isCurrent ? '600' : '400',
                                            marginTop: 4
                                        }
                                    ]}
                                >
                                    {milestone.title}
                                </Text>
                                <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                                    {milestone.description}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginBottom: 16,
    },
    timeline: {
        paddingLeft: 8,
    },
    milestoneItem: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    milestoneLeft: {
        alignItems: 'center',
        marginRight: 16,
    },
    milestoneCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    currentDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FFFFFF',
    },
    connector: {
        width: 2,
        flex: 1,
        marginTop: 4,
        marginBottom: 4,
    },
    milestoneContent: {
        flex: 1,
    },
    milestoneHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    weekBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    currentBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
});
