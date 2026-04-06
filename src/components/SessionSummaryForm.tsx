import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Card } from './Card';
import { Button } from './Button';

interface SessionSummaryFormProps {
    activity: string;
    sessionData: {
        minutes: number;
        attempts: number;
        successes: number;
        successRate: number;
        qualityRating: number;
    };
    onComplete: (summaryData: SessionSummaryData) => void;
    onCancel: () => void;
}

export interface SessionSummaryData {
    goalAchievement: 'not-met' | 'partially-met' | 'fully-met' | 'exceeded';
    birdMoodAfter: 'happy' | 'neutral' | 'frustrated' | 'tired';
    hadBreakthrough: boolean;
    breakthroughDescription: string;
    challengesNotes: string;
    whatWorkedWell: string;
    nextSessionPlan: string;
}

export const SessionSummaryForm: React.FC<SessionSummaryFormProps> = ({
    activity,
    sessionData,
    onComplete,
    onCancel
}) => {
    const { theme } = useTheme();
    const [goalAchievement, setGoalAchievement] = useState<'not-met' | 'partially-met' | 'fully-met' | 'exceeded'>('partially-met');
    const [birdMood, setBirdMood] = useState<'happy' | 'neutral' | 'frustrated' | 'tired'>('happy');
    const [hadBreakthrough, setHadBreakthrough] = useState(false);
    const [breakthroughDesc, setBreakthroughDesc] = useState('');
    const [challenges, setChallenges] = useState('');
    const [whatWorked, setWhatWorked] = useState('');
    const [nextPlan, setNextPlan] = useState('');

    const handleComplete = () => {
        onComplete({
            goalAchievement,
            birdMoodAfter: birdMood,
            hadBreakthrough,
            breakthroughDescription: breakthroughDesc,
            challengesNotes: challenges,
            whatWorkedWell: whatWorked,
            nextSessionPlan: nextPlan
        });
    };

    const OptionButton = ({
        label,
        icon,
        selected,
        onPress,
        color
    }: {
        label: string;
        icon: string;
        selected: boolean;
        onPress: () => void;
        color?: string;
    }) => (
        <TouchableOpacity
            style={[
                styles.optionButton,
                {
                    backgroundColor: selected ? (color || theme.colors.brand.primary) + '20' : theme.colors.surface,
                    borderColor: selected ? (color || theme.colors.brand.primary) : theme.colors.border,
                }
            ]}
            onPress={onPress}
        >
            <Text style={styles.optionIcon}>{icon}</Text>
            <Text style={[
                theme.typography.bodySmall,
                { color: selected ? (color || theme.colors.brand.primary) : theme.colors.text, fontWeight: selected ? '600' : '400' }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <View style={styles.header}>
                    <Text style={[theme.typography.h2, { color: theme.colors.text }]}>
                        Session Summary
                    </Text>
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                        {activity}
                    </Text>
                </View>

                {/* Session Stats */}
                <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.statRow}>
                        <View style={styles.statItem}>
                            <Text style={[theme.typography.h2, { color: theme.colors.text }]}>
                                {sessionData.minutes}
                            </Text>
                            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                                Minutes
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[theme.typography.h2, { color: theme.colors.text }]}>
                                {sessionData.attempts}
                            </Text>
                            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                                Attempts
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[theme.typography.h2, { color: theme.colors.brand.safe }]}>
                                {sessionData.successRate}%
                            </Text>
                            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                                Success
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[theme.typography.h2, { color: theme.colors.text }]}>
                                {'⭐'.repeat(sessionData.qualityRating)}
                            </Text>
                            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                                Quality
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Goal Achievement */}
                <View style={styles.section}>
                    <Text style={[theme.typography.body, { color: theme.colors.text, marginBottom: 12 }]}>
                        Goal Achievement
                    </Text>
                    <View style={styles.optionGrid}>
                        <OptionButton
                            label="Not Met"
                            icon="❌"
                            selected={goalAchievement === 'not-met'}
                            onPress={() => setGoalAchievement('not-met')}
                            color={theme.colors.brand.toxic}
                        />
                        <OptionButton
                            label="Partially Met"
                            icon="🟡"
                            selected={goalAchievement === 'partially-met'}
                            onPress={() => setGoalAchievement('partially-met')}
                            color={theme.colors.brand.coral}
                        />
                        <OptionButton
                            label="Fully Met"
                            icon="✅"
                            selected={goalAchievement === 'fully-met'}
                            onPress={() => setGoalAchievement('fully-met')}
                            color={theme.colors.brand.safe}
                        />
                        <OptionButton
                            label="Exceeded"
                            icon="🎉"
                            selected={goalAchievement === 'exceeded'}
                            onPress={() => setGoalAchievement('exceeded')}
                            color={theme.colors.brand.safe}
                        />
                    </View>
                </View>

                {/* Bird's Mood After */}
                <View style={styles.section}>
                    <Text style={[theme.typography.body, { color: theme.colors.text, marginBottom: 12 }]}>
                        Bird's Mood After Session
                    </Text>
                    <View style={styles.optionGrid}>
                        <OptionButton label="Happy" icon="😊" selected={birdMood === 'happy'} onPress={() => setBirdMood('happy')} />
                        <OptionButton label="Neutral" icon="😐" selected={birdMood === 'neutral'} onPress={() => setBirdMood('neutral')} />
                        <OptionButton label="Frustrated" icon="😤" selected={birdMood === 'frustrated'} onPress={() => setBirdMood('frustrated')} />
                        <OptionButton label="Tired" icon="😴" selected={birdMood === 'tired'} onPress={() => setBirdMood('tired')} />
                    </View>
                </View>

                {/* Breakthrough */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={[
                            styles.breakthroughToggle,
                            {
                                backgroundColor: hadBreakthrough ? theme.colors.brand.safe + '20' : theme.colors.surface,
                                borderColor: hadBreakthrough ? theme.colors.brand.safe : theme.colors.border
                            }
                        ]}
                        onPress={() => setHadBreakthrough(!hadBreakthrough)}
                    >
                        <Text style={[theme.typography.body, { color: theme.colors.text }]}>
                            {hadBreakthrough ? '✅' : '☐'} Breakthrough Moment
                        </Text>
                    </TouchableOpacity>
                    {hadBreakthrough && (
                        <TextInput
                            style={[
                                styles.textInput,
                                theme.typography.body,
                                {
                                    backgroundColor: theme.colors.background,
                                    color: theme.colors.text,
                                    borderColor: theme.colors.border,
                                }
                            ]}
                            value={breakthroughDesc}
                            onChangeText={setBreakthroughDesc}
                            placeholder="Describe the breakthrough..."
                            placeholderTextColor={theme.colors.textSecondary}
                            multiline
                        />
                    )}
                </View>

                {/* Notes */}
                <View style={styles.section}>
                    <Text style={[theme.typography.body, { color: theme.colors.text, marginBottom: 8 }]}>
                        What Worked Well
                    </Text>
                    <TextInput
                        style={[
                            styles.textInput,
                            theme.typography.body,
                            {
                                backgroundColor: theme.colors.background,
                                color: theme.colors.text,
                                borderColor: theme.colors.border,
                            }
                        ]}
                        value={whatWorked}
                        onChangeText={setWhatWorked}
                        placeholder="e.g., Bird responded well to sunflower seeds..."
                        placeholderTextColor={theme.colors.textSecondary}
                        multiline
                    />
                </View>

                <View style={styles.section}>
                    <Text style={[theme.typography.body, { color: theme.colors.text, marginBottom: 8 }]}>
                        Challenges Encountered
                    </Text>
                    <TextInput
                        style={[
                            styles.textInput,
                            theme.typography.body,
                            {
                                backgroundColor: theme.colors.background,
                                color: theme.colors.text,
                                borderColor: theme.colors.border,
                            }
                        ]}
                        value={challenges}
                        onChangeText={setChallenges}
                        placeholder="e.g., Got distracted by noise outside..."
                        placeholderTextColor={theme.colors.textSecondary}
                        multiline
                    />
                </View>

                <View style={styles.section}>
                    <Text style={[theme.typography.body, { color: theme.colors.text, marginBottom: 8 }]}>
                        Next Session Plan
                    </Text>
                    <TextInput
                        style={[
                            styles.textInput,
                            theme.typography.body,
                            {
                                backgroundColor: theme.colors.background,
                                color: theme.colors.text,
                                borderColor: theme.colors.border,
                            }
                        ]}
                        value={nextPlan}
                        onChangeText={setNextPlan}
                        placeholder="e.g., Increase distance for recall training..."
                        placeholderTextColor={theme.colors.textSecondary}
                        multiline
                    />
                </View>

                <View style={styles.actions}>
                    <Button
                        title="Cancel"
                        onPress={onCancel}
                        variant="secondary"
                        style={{ flex: 1, marginRight: 8 }}
                    />
                    <Button
                        title="Save Session"
                        onPress={handleComplete}
                        style={{ flex: 1 }}
                    />
                </View>
            </Card>
        </ScrollView>
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
        marginBottom: 16,
    },
    statsCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    section: {
        marginBottom: 20,
    },
    optionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 2,
        gap: 6,
        minWidth: '48%',
        flex: 1,
    },
    optionIcon: {
        fontSize: 18,
    },
    breakthroughToggle: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        marginBottom: 12,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
});
