import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/StorageService';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Card } from './Card';
import { TrainingSessionLog } from '../types';
import { TrainingTemplate } from '../utils/trainingTemplates';
import { generateAIRecommendations, markRecommendationAsRead, markRecommendationAsCompleted, AIRecommendation } from '../services/aiRecommendations';
import { executeRecommendationAction, RecommendationAction } from '../services/recommendationActions';
import { AlertService } from '../services/AlertService';
import { RecommendationsTutorial } from './RecommendationsTutorial';

import { TrainingPlan } from '../types';

interface RecommendationsViewProps {
    planId: string;
    sessions: TrainingSessionLog[];
    template: TrainingTemplate | null;
    currentWeek: number;
    onUpdatePlan: (planId: string, updates: Partial<TrainingPlan>) => void;
    onCreateTask: (task: { title: string; description: string; category: string }) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
    planId,
    sessions,
    template,
    currentWeek,
    onUpdatePlan,
    onCreateTask
}) => {
    const { theme } = useTheme();
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showTutorial, setShowTutorial] = useState(false);

    const loadRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
            const recs = await generateAIRecommendations(planId, sessions, template, currentWeek);
            setRecommendations(recs);
        } catch (err) {
            setError('Failed to load recommendations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecommendations();

        // Show tutorial on first visit
        const checkTutorial = async () => {
            const hasSeenTutorial = await StorageService.getItem('recommendations-tutorial-seen');
            if (!hasSeenTutorial) {
                setShowTutorial(true);
                await StorageService.setItem('recommendations-tutorial-seen', 'true');
            }
        };
        checkTutorial();
    }, [sessions.length, currentWeek]);

    const handleExpand = async (rec: AIRecommendation) => {
        if (expandedId === rec.id) {
            setExpandedId(null);
        } else {
            setExpandedId(rec.id);
            // Mark as read when expanded
            if (!rec.isRead) {
                await markRecommendationAsRead(rec.id);
                await loadRecommendations(); // Refresh to update UI
            }
        }
    };

    const handleMarkDone = async (id: string) => {
        await markRecommendationAsCompleted(id);
        await loadRecommendations(); // Refresh to remove from list
    };

    const handleExecuteAction = async (action: any) => {
        const result = await executeRecommendationAction(
            action,
            planId,
            onUpdatePlan,
            onCreateTask
        );
        if (result.success) {
            AlertService.alert('Success!', result.message);
        } else {
            AlertService.alert('Error', result.message);
        }
    };

    if (sessions.length === 0) {
        return (
            <Card style={styles.container}>
                <View style={styles.emptyState}>
                    <Text style={{ fontSize: 48, marginBottom: 16 }}>🤖</Text>
                    <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 8 }]}>
                        No Data Yet
                    </Text>
                    <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                        Complete a few training sessions to receive AI-powered recommendations.
                    </Text>
                </View>
            </Card>
        );
    }

    if (loading) {
        return (
            <Card style={styles.container}>
                <View style={styles.loadingState}>
                    <ActivityIndicator size="large" color={theme.colors.brand.primary} />
                    <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 16 }]}>
                        Analyzing your training data...
                    </Text>
                </View>
            </Card>
        );
    }

    if (error) {
        return (
            <Card style={styles.container}>
                <View style={styles.errorState}>
                    <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
                    <Text style={[theme.typography.body, { color: theme.colors.text, marginBottom: 16 }]}>
                        {error}
                    </Text>
                    <TouchableOpacity
                        onPress={loadRecommendations}
                        style={[styles.retryButton, { backgroundColor: theme.colors.brand.primary }]}
                    >
                        <Text style={[theme.typography.body, { color: '#FFFFFF' }]}>
                            Try Again
                        </Text>
                    </TouchableOpacity>
                </View>
            </Card>
        );
    }

    const unreadCount = recommendations.filter(r => !r.isRead).length;

    return (
        <ScrollView style={styles.container}>
            {/* Header with unread badge */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                        🤖 AI Recommendations
                    </Text>
                    {unreadCount > 0 && (
                        <View style={[styles.unreadBadge, { backgroundColor: theme.colors.brand.primary }]}>
                            <Text style={[theme.typography.caption, { color: '#FFFFFF', fontWeight: '600' }]}>
                                {unreadCount} new
                            </Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity
                    onPress={() => setShowTutorial(true)}
                    style={[styles.helpIconButton, { backgroundColor: theme.colors.brand.primary + '15' }]}
                >
                    <Text style={{ fontSize: 16 }}>❓</Text>
                    {unreadCount > 0 && (
                        <View style={[styles.helpBadge, { backgroundColor: theme.colors.brand.primary }]} />
                    )}
                </TouchableOpacity>
                <TouchableOpacity onPress={loadRecommendations}>
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.brand.primary }]}>
                        🔄 Refresh
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Tutorial Popup */}
            <RecommendationsTutorial
                visible={showTutorial}
                onClose={() => setShowTutorial(false)}
            />

            {recommendations.length === 0 ? (
                <Card style={{ padding: 24, alignItems: 'center' }}>
                    <Text style={{ fontSize: 32, marginBottom: 12 }}>✅</Text>
                    <Text style={[theme.typography.body, { color: theme.colors.text, textAlign: 'center' }]}>
                        All caught up! Keep training and check back later for new recommendations.
                    </Text>
                </Card>
            ) : (
                <>
                    {/* Inbox List */}
                    {recommendations.map((rec, index) => {
                        const isExpanded = expandedId === rec.id;
                        return (
                            <TouchableOpacity
                                key={rec.id}
                                onPress={() => handleExpand(rec)}
                                style={[
                                    styles.inboxItem,
                                    {
                                        backgroundColor: rec.isRead ? theme.colors.surface : theme.colors.brand.primary + '10',
                                        borderLeftColor: rec.priority === 'high' ? theme.colors.brand.primary :
                                            rec.priority === 'medium' ? theme.colors.brand.coral :
                                                theme.colors.brand.safe,
                                        marginBottom: index === recommendations.length - 1 ? 0 : 12
                                    }
                                ]}
                            >
                                {/* Collapsed View */}
                                <View style={styles.inboxHeader}>
                                    {!rec.isRead && (
                                        <View style={[styles.unreadDot, { backgroundColor: theme.colors.brand.primary }]} />
                                    )}
                                    <Text style={{ fontSize: 20, marginRight: 8 }}>{rec.icon}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: rec.isRead ? '500' : '600' }]}>
                                            {rec.title}
                                        </Text>
                                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, textTransform: 'uppercase', marginTop: 2 }]}>
                                            {rec.category} • {rec.priority}
                                        </Text>
                                    </View>
                                    <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
                                        {isExpanded ? '▼' : '▶'}
                                    </Text>
                                </View>

                                {/* Expanded View */}
                                {isExpanded && (
                                    <View style={styles.expandedContent}>
                                        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                                        <Text style={[theme.typography.body, { color: theme.colors.text, lineHeight: 22, marginBottom: 16 }]}>
                                            {rec.description}
                                        </Text>

                                        {/* Action Buttons */}
                                        {rec.actions && rec.actions.length > 0 && (
                                            <View style={styles.actionsContainer}>
                                                {rec.actions.map((action, actionIndex) => (
                                                    <TouchableOpacity
                                                        key={actionIndex}
                                                        onPress={() => handleExecuteAction(action)}
                                                        style={[styles.actionButton, { backgroundColor: theme.colors.brand.primary }]}
                                                    >
                                                        <Text style={[theme.typography.bodySmall, { color: '#FFFFFF', fontWeight: '600' }]}>
                                                            {action.icon} {action.label}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}

                                        <TouchableOpacity
                                            onPress={() => handleMarkDone(rec.id)}
                                            style={[styles.doneButton, { backgroundColor: theme.colors.brand.safe }]}
                                        >
                                            <Text style={[theme.typography.body, { color: '#FFFFFF', fontWeight: '600' }]}>
                                                ✓ Mark as Done
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </>
            )}

            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 16 }]}>
                Powered by AI • Based on {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    loadingState: {
        alignItems: 'center',
        padding: 40,
    },
    errorState: {
        alignItems: 'center',
        padding: 40,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    unreadBadge: {
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    helpIconButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        position: 'relative',
    },
    helpBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    inboxItem: {
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
    },
    inboxHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    expandedContent: {
        marginTop: 12,
    },
    divider: {
        height: 1,
        marginBottom: 12,
    },
    actionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    actionButton: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    doneButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
});
