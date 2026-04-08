import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Card } from './Card';
import { TrainingSessionLog } from '../types';
import { TrainingTemplate } from '../utils/trainingTemplates';
import { generateTrainingInsights, TrainingInsights as InsightsData } from '../utils/trainingInsights';

interface TrainingInsightsProps {
    sessions: TrainingSessionLog[];
    template: TrainingTemplate | null;
    currentWeek: number;
}

export const TrainingInsights: React.FC<TrainingInsightsProps> = ({
    sessions,
    template,
    currentWeek
}) => {
    const { theme } = useTheme();

    const insights: InsightsData = generateTrainingInsights(sessions, template, currentWeek);

    if (sessions.length === 0) {
        return (
            <Card style={styles.container}>
                <View style={styles.emptyState}>
                    <Text style={{ fontSize: 48, marginBottom: 16 }}>📊</Text>
                    <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 8 }]}>
                        No Data Yet
                    </Text>
                    <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                        Complete a few training sessions to see intelligent insights and personalized recommendations.
                    </Text>
                </View>
            </Card>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Quick Stats */}
            <View style={styles.quickStatsRow}>
                <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                        Current Streak
                    </Text>
                    <Text style={[theme.typography.h2, { color: theme.colors.brand.primary, marginTop: 4 }]}>
                        {insights.quickStats.currentStreak}
                    </Text>
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                        days
                    </Text>
                </Card>

                <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                        This Week
                    </Text>
                    <Text style={[theme.typography.h2, { color: theme.colors.brand.safe, marginTop: 4 }]}>
                        {insights.quickStats.sessionsThisWeek}
                    </Text>
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                        sessions
                    </Text>
                </Card>

                <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                        Next Milestone
                    </Text>
                    <Text style={[theme.typography.body, { color: theme.colors.text, marginTop: 4, fontWeight: '600' }]}>
                        {insights.quickStats.nextMilestoneETA}
                    </Text>
                </Card>
            </View>

            {/* Warnings */}
            {insights.warnings.length > 0 && (
                <Card style={[styles.section, { backgroundColor: theme.colors.brand.toxic + '10', borderColor: theme.colors.brand.toxic, borderWidth: 1 }]}>
                    <Text style={[theme.typography.h3, { color: theme.colors.brand.toxic, marginBottom: 12 }]}>
                        ⚠️ Attention Needed
                    </Text>
                    {insights.warnings.map((warning, index) => (
                        <View key={index} style={[styles.warningItem, { borderColor: theme.colors.border }]}>
                            <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '600', marginBottom: 4 }]}>
                                {warning.message}
                            </Text>
                            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
                                💡 {warning.suggestion}
                            </Text>
                        </View>
                    ))}
                </Card>
            )}

            {/* AI Recommendations */}
            <Card style={styles.section}>
                <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 12 }]}>
                    🤖 AI Recommendations
                </Text>
                {insights.recommendations.slice(0, 3).map((rec, index) => (
                    <View
                        key={rec.id}
                        style={[
                            styles.recommendationItem,
                            {
                                backgroundColor: theme.colors.surface,
                                borderLeftColor: rec.priority === 'high' ? theme.colors.brand.primary :
                                    rec.priority === 'medium' ? theme.colors.brand.coral :
                                        theme.colors.brand.safe,
                                marginBottom: index === insights.recommendations.slice(0, 3).length - 1 ? 0 : 12
                            }
                        ]}
                    >
                        <View style={styles.recommendationHeader}>
                            <Text style={{ fontSize: 20, marginRight: 8 }}>{rec.icon}</Text>
                            <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '600', flex: 1 }]}>
                                {rec.title}
                            </Text>
                            {rec.priority === 'high' && (
                                <View style={[styles.priorityBadge, { backgroundColor: theme.colors.brand.primary }]}>
                                    <Text style={[theme.typography.caption, { color: '#FFFFFF', fontSize: 10 }]}>
                                        HIGH
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 4, marginBottom: 8 }]}>
                            {rec.description}
                        </Text>
                        <View style={[styles.actionableBox, { backgroundColor: theme.colors.brand.primary + '10' }]}>
                            <Text style={[theme.typography.bodySmall, { color: theme.colors.brand.primary, fontWeight: '600' }]}>
                                ✓ {rec.actionable}
                            </Text>
                        </View>
                    </View>
                ))}
            </Card>

            {/* Progress Trends */}
            <Card style={styles.section}>
                <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 12 }]}>
                    📊 Progress Trends
                </Text>

                <View style={styles.trendRow}>
                    <View style={styles.trendItem}>
                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                            Success Rate
                        </Text>
                        <Text style={[theme.typography.h3, { color: theme.colors.brand.safe, marginTop: 4 }]}>
                            {insights.trends.averageSuccessRate.toFixed(0)}%
                        </Text>
                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                            {insights.quickStats.successRateTrend}
                        </Text>
                    </View>

                    <View style={styles.trendItem}>
                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                            Consistency
                        </Text>
                        <Text style={[theme.typography.h3, { color: theme.colors.brand.primary, marginTop: 4 }]}>
                            {insights.trends.consistencyScore.toFixed(0)}%
                        </Text>
                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                            {insights.trends.averageSessionsPerWeek.toFixed(1)}/week
                        </Text>
                    </View>

                    <View style={styles.trendItem}>
                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                            Best Time
                        </Text>
                        <Text style={[theme.typography.body, { color: theme.colors.text, marginTop: 4, fontWeight: '600', textTransform: 'capitalize' }]}>
                            {insights.trends.bestTimeOfDay}
                        </Text>
                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                            ⏰
                        </Text>
                    </View>
                </View>

                {!!insights.prediction && (
                    <View style={[styles.predictionBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                        <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginBottom: 4 }]}>
                            📈 Prediction
                        </Text>
                        <Text style={[theme.typography.body, { color: theme.colors.text }]}>
                            {insights.prediction.reasoning}
                        </Text>
                        <View style={[styles.confidenceBadge, {
                            backgroundColor: insights.prediction.confidenceLevel === 'high' ? theme.colors.brand.safe + '20' :
                                insights.prediction.confidenceLevel === 'medium' ? theme.colors.brand.coral + '20' :
                                    theme.colors.brand.toxic + '20'
                        }]}>
                            <Text style={[theme.typography.caption, {
                                color: insights.prediction.confidenceLevel === 'high' ? theme.colors.brand.safe :
                                    insights.prediction.confidenceLevel === 'medium' ? theme.colors.brand.coral :
                                        theme.colors.brand.toxic,
                                textTransform: 'uppercase',
                                fontWeight: '600'
                            }]}>
                                {insights.prediction.confidenceLevel} confidence
                            </Text>
                        </View>
                    </View>
                )}
            </Card>

            {/* Breakthroughs */}
            {insights.breakthroughs.length > 0 && (
                <Card style={styles.section}>
                    <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 12 }]}>
                        🎉 Breakthrough Moments
                    </Text>
                    {insights.breakthroughs.slice(0, 5).map((breakthrough, index) => (
                        <View
                            key={breakthrough.sessionId + index}
                            style={[
                                styles.breakthroughItem,
                                { borderColor: theme.colors.border, marginBottom: index === Math.min(4, insights.breakthroughs.length - 1) ? 0 : 12 }
                            ]}
                        >
                            <View style={[styles.breakthroughDot, { backgroundColor: theme.colors.brand.safe }]} />
                            <View style={{ flex: 1 }}>
                                <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '600' }]}>
                                    {breakthrough.title}
                                </Text>
                                <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                                    {breakthrough.description}
                                </Text>
                                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                                    {new Date(breakthrough.date).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    ))}
                </Card>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    quickStatsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
    },
    section: {
        marginBottom: 16,
        padding: 16,
    },
    warningItem: {
        paddingBottom: 12,
        marginBottom: 12,
        borderBottomWidth: 1,
    },
    recommendationItem: {
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
    },
    recommendationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    actionableBox: {
        padding: 12,
        borderRadius: 8,
    },
    trendRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    trendItem: {
        flex: 1,
        alignItems: 'center',
    },
    predictionBox: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 8,
    },
    confidenceBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 8,
    },
    breakthroughItem: {
        flexDirection: 'row',
        paddingBottom: 12,
        borderBottomWidth: 1,
        gap: 12,
    },
    breakthroughDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 4,
    },
});
