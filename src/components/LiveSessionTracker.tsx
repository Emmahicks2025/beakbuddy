import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Card } from './Card';
import { Button } from './Button';
import { Observable } from '../utils/trainingTemplates';

interface LiveSessionTrackerProps {
    activity: string;
    observables?: Observable[];
    onComplete: (sessionData: LiveSessionData) => void;
    onCancel: () => void;
}

export interface LiveSessionData {
    minutes: number;
    attempts: number;
    successes: number;
    successRate: number;
    qualityRating: number;
    observedBehaviors: string[]; // IDs of checked observables
}

export const LiveSessionTracker: React.FC<LiveSessionTrackerProps> = ({
    activity,
    observables,
    onComplete,
    onCancel
}) => {
    const { theme } = useTheme();
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const [attempts, setAttempts] = useState(0);
    const [successes, setSuccesses] = useState(0);
    const [qualityRating, setQualityRating] = useState(3);
    const [observedBehaviors, setObservedBehaviors] = useState<string[]>([]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const successRate = attempts > 0 ? Math.round((successes / attempts) * 100) : 0;

    const toggleObservable = (id: string) => {
        setObservedBehaviors(prev =>
            prev.includes(id)
                ? prev.filter(obsId => obsId !== id)
                : [...prev, id]
        );
    };

    const handleComplete = () => {
        setIsRunning(false);
        onComplete({
            minutes: Math.ceil(seconds / 60),
            attempts,
            successes,
            successRate,
            qualityRating,
            observedBehaviors
        });
    };

    const Counter = ({
        label,
        value,
        icon,
        color,
        onIncrement,
        onDecrement
    }: {
        label: string;
        value: number;
        icon: string;
        color: string;
        onIncrement: () => void;
        onDecrement: () => void;
    }) => (
        <View style={[styles.counter, { backgroundColor: color + '10' }]}>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                {icon} {label}
            </Text>
            <View style={styles.counterControls}>
                <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: color + '20', borderColor: color }]}
                    onPress={onDecrement}
                    disabled={value === 0}
                >
                    <Text style={[theme.typography.h3, { color }]}>−</Text>
                </TouchableOpacity>
                <Text style={[theme.typography.h1, { color: theme.colors.text, minWidth: 60, textAlign: 'center' }]}>
                    {value}
                </Text>
                <TouchableOpacity
                    style={[styles.counterButton, { backgroundColor: color + '20', borderColor: color }]}
                    onPress={onIncrement}
                >
                    <Text style={[theme.typography.h3, { color }]}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <View style={styles.header}>
                    <Text style={[theme.typography.h2, { color: theme.colors.text }]}>
                        🎯 {activity}
                    </Text>
                    <View style={[styles.timerBadge, { backgroundColor: isRunning ? theme.colors.brand.safe + '20' : theme.colors.border }]}>
                        <Text style={[
                            theme.typography.h2,
                            { color: isRunning ? theme.colors.brand.safe : theme.colors.textSecondary }
                        ]}>
                            ⏱️ {formatTime(seconds)}
                        </Text>
                    </View>
                </View>

                <View style={styles.countersGrid}>
                    <Counter
                        label="Attempts"
                        value={attempts}
                        icon="🎯"
                        color={theme.colors.brand.primary}
                        onIncrement={() => setAttempts(a => a + 1)}
                        onDecrement={() => setAttempts(a => Math.max(0, a - 1))}
                    />
                    <Counter
                        label="Successes"
                        value={successes}
                        icon="✅"
                        color={theme.colors.brand.safe}
                        onIncrement={() => {
                            setSuccesses(s => s + 1);
                            setAttempts(a => Math.max(a, successes + 1)); // Auto-increment attempts if needed
                        }}
                        onDecrement={() => setSuccesses(s => Math.max(0, s - 1))}
                    />
                </View>

                <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.statRow}>
                        <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
                            Success Rate
                        </Text>
                        <Text style={[theme.typography.h2, { color: theme.colors.brand.safe }]}>
                            {successRate}%
                        </Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${successRate}%`,
                                    backgroundColor: theme.colors.brand.safe
                                }
                            ]}
                        />
                    </View>
                </View>

                {/* Observable Behaviors Checklist */}
                {observables && observables.length > 0 && (
                    <ScrollView style={styles.observablesSection} nestedScrollEnabled>
                        <Text style={[theme.typography.body, { color: theme.colors.text, marginBottom: 12, fontWeight: '600' }]}>
                            📝 What Did You Observe?
                        </Text>
                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 12 }]}>
                            Check off behaviors you observed during this session
                        </Text>
                        {observables.map((observable) => {
                            const isChecked = observedBehaviors.includes(observable.id);
                            const categoryIcon = observable.category === 'milestone' ? '🎯' : observable.category === 'skill' ? '⭐' : '👁️';
                            const categoryColor = observable.category === 'milestone' ? theme.colors.brand.safe : observable.category === 'skill' ? theme.colors.brand.coral : theme.colors.brand.primary;

                            return (
                                <TouchableOpacity
                                    key={observable.id}
                                    style={[
                                        styles.observableItem,
                                        {
                                            backgroundColor: isChecked ? categoryColor + '15' : theme.colors.surface,
                                            borderColor: isChecked ? categoryColor : theme.colors.border,
                                        }
                                    ]}
                                    onPress={() => toggleObservable(observable.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.checkbox,
                                        {
                                            backgroundColor: isChecked ? categoryColor : 'transparent',
                                            borderColor: isChecked ? categoryColor : theme.colors.border,
                                        }
                                    ]}>
                                        {isChecked && (
                                            <Text style={styles.checkmark}>✓</Text>
                                        )}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.observableHeader}>
                                            <Text style={styles.categoryIcon}>{categoryIcon}</Text>
                                            <Text style={[
                                                theme.typography.bodySmall,
                                                {
                                                    color: isChecked ? categoryColor : theme.colors.text,
                                                    fontWeight: isChecked ? '600' : '400',
                                                    flex: 1
                                                }
                                            ]}>
                                                {observable.description}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                        <View style={[styles.progressIndicator, { backgroundColor: theme.colors.surface }]}>
                            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                                Progress: {observedBehaviors.length}/{observables.length} observed
                            </Text>
                            <View style={[styles.miniProgressBar, { backgroundColor: theme.colors.border }]}>
                                <View
                                    style={[
                                        styles.miniProgressFill,
                                        {
                                            width: `${(observedBehaviors.length / observables.length) * 100}%`,
                                            backgroundColor: theme.colors.brand.safe
                                        }
                                    ]}
                                />
                            </View>
                        </View>
                    </ScrollView>
                )}

                <View style={styles.qualitySection}>
                    <Text style={[theme.typography.body, { color: theme.colors.text, marginBottom: 12 }]}>
                        Quality Rating
                    </Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setQualityRating(star)}
                                style={styles.starButton}
                            >
                                <Text style={styles.star}>
                                    {star <= qualityRating ? '⭐' : '☆'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8 }]}>
                        {qualityRating === 1 && 'Struggled - needs more practice'}
                        {qualityRating === 2 && 'Some difficulty - keep working'}
                        {qualityRating === 3 && 'Good effort - making progress'}
                        {qualityRating === 4 && 'Great performance!'}
                        {qualityRating === 5 && 'Excellent! Mastered this skill!'}
                    </Text>
                </View>

                <View style={[styles.tipBox, { backgroundColor: theme.colors.brand.primary + '10' }]}>
                    <Text style={[theme.typography.caption, { color: theme.colors.brand.primary, fontWeight: '600' }]}>
                        💡 Training Tip
                    </Text>
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.text, marginTop: 4 }]}>
                        Keep sessions short (1-5 minutes). End on a positive note with a successful attempt!
                    </Text>
                </View>

                <View style={styles.actions}>
                    <Button
                        title="Cancel"
                        onPress={onCancel}
                        variant="secondary"
                        style={{ flex: 1, marginRight: 8 }}
                    />
                    <Button
                        title="Complete Session"
                        onPress={handleComplete}
                        style={{ flex: 1 }}
                    />
                </View>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // Force solid background as this renders in a full-screen Modal
        backgroundColor: '#F9FAFB',
    },
    card: {
        padding: 16,
        margin: 16,
    },
    header: {
        marginBottom: 24,
        alignItems: 'center',
    },
    timerBadge: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        marginTop: 12,
    },
    countersGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    counter: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    counterControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 8,
    },
    counterButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    qualitySection: {
        marginBottom: 16,
    },
    starsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    starButton: {
        padding: 4,
    },
    star: {
        fontSize: 32,
    },
    tipBox: {
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    observablesSection: {
        marginBottom: 24,
        padding: 16,
        backgroundColor: 'rgba(128, 64, 191, 0.03)',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(128, 64, 191, 0.1)',
    },
    metricsSection: {
        marginBottom: 16,
    },
    observableItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 2,
        marginBottom: 10,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    observableHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryIcon: {
        fontSize: 18,
    },
    progressIndicator: {
        padding: 14,
        borderRadius: 12,
        marginTop: 12,
        borderWidth: 2,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    miniProgressBar: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    miniProgressFill: {
        height: '100%',
        borderRadius: 3,
    },
});
