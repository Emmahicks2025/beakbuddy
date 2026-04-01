import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Card } from './Card';
import { Button } from './Button';
import { TrainingTemplate, Milestone } from '../utils/trainingTemplates';

interface TrainingWizardProps {
    template: TrainingTemplate;
    onComplete: (planData: { title: string; goal: string; sessionsPerWeek: number; templateId: string }) => void;
    onCancel: () => void;
}

export const TrainingWizard: React.FC<TrainingWizardProps> = ({ template, onComplete, onCancel }) => {
    const { theme } = useTheme();
    const [step, setStep] = useState(1);
    const totalSteps = 3;

    const handleComplete = () => {
        onComplete({
            title: template.title,
            goal: template.description,
            sessionsPerWeek: template.sessionsPerWeek,
            templateId: template.id
        });
    };

    return (
        <View style={styles.container}>
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
                {[1, 2, 3].map((s) => (
                    <View
                        key={s}
                        style={[
                            styles.progressDot,
                            {
                                backgroundColor: s <= step ? theme.colors.brand.primary : theme.colors.border
                            }
                        ]}
                    />
                ))}
            </View>

            <ScrollView style={styles.content}>
                {/* Step 1: Overview */}
                {step === 1 && (
                    <View>
                        <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 8 }]}>
                            {template.icon} {template.title}
                        </Text>
                        <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: 24 }]}>
                            {template.description}
                        </Text>

                        <Card style={styles.infoCard}>
                            <View style={styles.infoRow}>
                                <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
                                    Difficulty
                                </Text>
                                <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '600' }]}>
                                    {template.difficulty}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
                                    Duration
                                </Text>
                                <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '600' }]}>
                                    {template.duration}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
                                    Sessions per week
                                </Text>
                                <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '600' }]}>
                                    {template.sessionsPerWeek}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
                                    Total milestones
                                </Text>
                                <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '600' }]}>
                                    {template.milestones.length}
                                </Text>
                            </View>
                        </Card>

                        <View style={[styles.tipCard, { backgroundColor: theme.colors.brand.primary + '15', borderRadius: 20, padding: 16, marginBottom: 16 }]}>
                            <Text style={[theme.typography.h3, { color: theme.colors.brand.primary, marginBottom: 8 }]}>
                                💡 What to expect
                            </Text>
                            <View style={{ overflow: 'visible' }}>
                                <Text style={[theme.typography.bodySmall, { color: theme.colors.text, lineHeight: 22 }]}>
                                    This program will guide you through a structured training plan with weekly milestones and daily activities.
                                    Consistency is key - try to complete the recommended sessions each week for best results.
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Step 2: Milestones */}
                {step === 2 && (
                    <View>
                        <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 8 }]}>
                            Training Milestones
                        </Text>
                        <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: 24 }]}>
                            Here's what you'll achieve week by week:
                        </Text>

                        {template.milestones.map((milestone, index) => (
                            <Card key={index} style={styles.milestoneCard}>
                                <View style={styles.milestoneHeader}>
                                    <View style={[styles.weekBadge, { backgroundColor: theme.colors.brand.primary }]}>
                                        <Text style={[theme.typography.caption, { color: '#FFFFFF', fontWeight: '600' }]}>
                                            Week {milestone.week}
                                        </Text>
                                    </View>
                                    <Text style={[theme.typography.h3, { color: theme.colors.text, flex: 1, marginLeft: 12 }]}>
                                        {milestone.title}
                                    </Text>
                                </View>
                                <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 8 }]}>
                                    {milestone.description}
                                </Text>
                            </Card>
                        ))}
                    </View>
                )}

                {/* Step 3: Daily Activities Preview */}
                {step === 3 && (
                    <View>
                        <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 8 }]}>
                            Ready to Start?
                        </Text>
                        <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: 24 }]}>
                            You'll receive daily activity suggestions to help you progress through each milestone.
                        </Text>

                        {template.dailyActivities.length > 0 && (
                            <>
                                <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 12 }]}>
                                    Example: Day 1 Activity
                                </Text>
                                <Card style={styles.activityCard}>
                                    <Text style={[theme.typography.h3, { color: theme.colors.brand.primary, marginBottom: 8 }]}>
                                        {template.dailyActivities[0].activity}
                                    </Text>
                                    <View style={styles.activityMeta}>
                                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                                            ⏱️ {template.dailyActivities[0].duration} minutes
                                        </Text>
                                    </View>
                                    <Text style={[theme.typography.bodySmall, { color: theme.colors.text, marginTop: 12 }]}>
                                        {template.dailyActivities[0].instructions}
                                    </Text>
                                    {template.dailyActivities[0].tips.length > 0 && (
                                        <View style={styles.tipsSection}>
                                            <Text style={[theme.typography.bodySmall, { color: theme.colors.brand.primary, fontWeight: '600', marginBottom: 6 }]}>
                                                💡 Tips:
                                            </Text>
                                            {template.dailyActivities[0].tips.map((tip, i) => (
                                                <Text key={i} style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 4 }]}>
                                                    • {tip}
                                                </Text>
                                            ))}
                                        </View>
                                    )}
                                </Card>
                            </>
                        )}

                        <Card style={[styles.tipCard, { backgroundColor: theme.colors.brand.safe + '10' }]}>
                            <Text style={[theme.typography.h3, { color: theme.colors.brand.safe, marginBottom: 8 }]}>
                                ✅ You're all set!
                            </Text>
                            <Text style={[theme.typography.bodySmall, { color: theme.colors.text }]}>
                                Click "Start Training" to begin your {template.title} program. You can track your progress,
                                log sessions, and view daily activities anytime from the Training tab.
                            </Text>
                        </Card>
                    </View>
                )}
            </ScrollView>

            {/* Navigation Buttons */}
            <View style={styles.footer}>
                {step > 1 && (
                    <Button
                        title="← Back"
                        onPress={() => setStep(step - 1)}
                        variant="secondary"
                        style={{ flex: 1 }}
                    />
                )}
                {step < totalSteps ? (
                    <Button
                        title="Next →"
                        onPress={() => setStep(step + 1)}
                        style={{ flex: 1 }}
                    />
                ) : (
                    <Button
                        title="Start Training"
                        onPress={handleComplete}
                        style={{ flex: 1 }}
                    />
                )}
                <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
                        Cancel
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    progressDot: {
        width: 32,
        height: 8,
        borderRadius: 4,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    infoCard: {
        padding: 16,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128, 64, 191, 0.1)',
    },
    tipCard: {
        padding: 16,
        marginBottom: 16,
    },
    milestoneCard: {
        padding: 16,
        marginBottom: 12,
    },
    milestoneHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    weekBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    activityCard: {
        padding: 16,
        marginBottom: 16,
    },
    activityMeta: {
        marginTop: 4,
    },
    tipsSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128, 64, 191, 0.1)',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128, 64, 191, 0.1)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
});
