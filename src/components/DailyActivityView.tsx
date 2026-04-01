import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Card } from './Card';
import { Button } from './Button';
import { TrainingTemplate, DailyActivity } from '../utils/trainingTemplates';
import { SessionSetupWizard, SessionSetupData } from './SessionSetupWizard';
import { LiveSessionTracker, LiveSessionData } from './LiveSessionTracker';
import { SessionSummaryForm, SessionSummaryData } from './SessionSummaryForm';

interface DailyActivityViewProps {
    template: TrainingTemplate;
    currentDay: number;
    onComplete: (sessionData: CompleteSessionData) => void;
    onSkip: () => void;
}

export interface CompleteSessionData {
    activity: string;
    minutes: number;
    notes: string;
    // Setup data
    birdMoodBefore: string;
    energyLevel: string;
    hungerLevel: string;
    environmentQuality: string;
    trainingMethod: string;
    reinforcementType: string;
    // Live session data
    attempts: number;
    successes: number;
    successRate: number;
    qualityRating: number;
    // Summary data
    goalAchievement: string;
    birdMoodAfter: string;
    hadBreakthrough: boolean;
    breakthroughDescription: string;
    challengesNotes: string;
    whatWorkedWell: string;
    nextSessionPlan: string;
}

export const DailyActivityView: React.FC<DailyActivityViewProps> = ({
    template,
    currentDay,
    onComplete,
    onSkip
}) => {
    const { theme } = useTheme();
    const [sessionPhase, setSessionPhase] = useState<'preview' | 'setup' | 'live' | 'summary'>('preview');
    const [setupData, setSetupData] = useState<SessionSetupData | null>(null);
    const [liveData, setLiveData] = useState<LiveSessionData | null>(null);

    // Get today's activity
    const activityIndex = (currentDay - 1) % template.dailyActivities.length;
    const todayActivity = template.dailyActivities[activityIndex] || {
        day: currentDay,
        activity: 'Practice Session',
        duration: 15,
        instructions: 'Continue practicing the techniques from previous sessions.',
        tips: ['Stay consistent', 'Be patient', 'Reward progress']
    };

    const handleStartSession = () => {
        setSessionPhase('setup');
    };

    const handleSetupComplete = (data: SessionSetupData) => {
        setSetupData(data);
        setSessionPhase('live');
    };

    const handleLiveComplete = (data: LiveSessionData) => {
        setLiveData(data);
        setSessionPhase('summary');
    };

    const handleSummaryComplete = (summaryData: SessionSummaryData) => {
        if (!setupData || !liveData) return;

        const completeData: CompleteSessionData = {
            activity: todayActivity.activity,
            minutes: liveData.minutes,
            notes: `Setup: ${setupData.trainingMethod} training with ${setupData.reinforcementType}. ${summaryData.whatWorkedWell}`,
            // Setup
            birdMoodBefore: setupData.birdMoodBefore,
            energyLevel: setupData.energyLevel,
            hungerLevel: setupData.hungerLevel,
            environmentQuality: setupData.environmentQuality,
            trainingMethod: setupData.trainingMethod,
            reinforcementType: setupData.reinforcementType,
            // Live
            attempts: liveData.attempts,
            successes: liveData.successes,
            successRate: liveData.successRate,
            qualityRating: liveData.qualityRating,
            // Summary
            goalAchievement: summaryData.goalAchievement,
            birdMoodAfter: summaryData.birdMoodAfter,
            hadBreakthrough: summaryData.hadBreakthrough,
            breakthroughDescription: summaryData.breakthroughDescription,
            challengesNotes: summaryData.challengesNotes,
            whatWorkedWell: summaryData.whatWorkedWell,
            nextSessionPlan: summaryData.nextSessionPlan,
        };

        onComplete(completeData);
        setSessionPhase('preview');
        setSetupData(null);
        setLiveData(null);
    };

    const handleCancel = () => {
        setSessionPhase('preview');
        setSetupData(null);
        setLiveData(null);
    };

    if (sessionPhase === 'setup') {
        return (
            <Modal visible={true} animationType="slide">
                <SessionSetupWizard
                    onComplete={handleSetupComplete}
                    onCancel={handleCancel}
                />
            </Modal>
        );
    }

    if (sessionPhase === 'live' && setupData) {
        return (
            <Modal visible={true} animationType="slide">
                <LiveSessionTracker
                    activity={todayActivity.activity}
                    observables={todayActivity.observables}
                    onComplete={handleLiveComplete}
                    onCancel={handleCancel}
                />
            </Modal>
        );
    }

    if (sessionPhase === 'summary' && liveData) {
        return (
            <Modal visible={true} animationType="slide">
                <SessionSummaryForm
                    activity={todayActivity.activity}
                    sessionData={liveData}
                    onComplete={handleSummaryComplete}
                    onCancel={handleCancel}
                />
            </Modal>
        );
    }

    // Preview phase
    return (
        <Card style={styles.container}>
            <View style={styles.header}>
                <View style={[styles.dayBadge, { backgroundColor: theme.colors.brand.primary }]}>
                    <Text style={[theme.typography.caption, { color: '#FFFFFF', fontWeight: '600' }]}>
                        Day {currentDay}
                    </Text>
                </View>
                <Text style={[theme.typography.h3, { color: theme.colors.text, flex: 1, marginLeft: 12 }]}>
                    Today's Activity
                </Text>
            </View>

            <View style={[styles.activityHeader, { backgroundColor: theme.colors.brand.primary + '10' }]}>
                <Text style={[theme.typography.h2, { color: theme.colors.brand.primary }]}>
                    {todayActivity.activity}
                </Text>
                <View style={styles.durationBadge}>
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
                        ⏱️ ~{todayActivity.duration} min
                    </Text>
                </View>
            </View>

            <View style={styles.instructionsSection}>
                <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 12 }]}>
                    📋 Instructions
                </Text>
                <Text style={[theme.typography.body, { color: theme.colors.text, lineHeight: 24 }]}>
                    {todayActivity.instructions}
                </Text>

                {todayActivity.tips && todayActivity.tips.length > 0 && (
                    <View style={styles.tipsSection}>
                        <Text style={[theme.typography.bodySmall, { color: theme.colors.brand.primary, fontWeight: '600', marginBottom: 8 }]}>
                            💡 Pro Tips:
                        </Text>
                        {todayActivity.tips.map((tip, index) => (
                            <View key={index} style={styles.tipItem}>
                                <Text style={[theme.typography.bodySmall, { color: theme.colors.text }]}>
                                    • {tip}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.actions}>
                <Button
                    title="🎯 Start Training Session"
                    onPress={handleStartSession}
                    style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                    title="Skip Today"
                    onPress={onSkip}
                    variant="secondary"
                    style={{ paddingHorizontal: 16 }}
                />
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dayBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    activityHeader: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    durationBadge: {
        marginTop: 8,
    },
    instructionsSection: {
        marginBottom: 16,
    },
    tipsSection: {
        marginTop: 16,
        padding: 12,
        backgroundColor: 'rgba(128, 64, 191, 0.05)',
        borderRadius: 8,
    },
    tipItem: {
        marginBottom: 6,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

