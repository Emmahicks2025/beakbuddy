import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, ScrollView, Platform } from 'react-native';
import { AppDateTimePicker } from './AppDateTimePicker';
import { useTheme } from '../theme/ThemeContext';
import { Card } from './Card';
import { Button } from './Button';
import { TrainingTemplate, TRAINING_TEMPLATES } from '../utils/trainingTemplates';
import { recommendationRepository } from '../database/recommendationRepository';
import { RecommendationRecord } from '../database/recommendationRepository';
import { generateAIRecommendations } from '../services/aiRecommendations';
import { MilestoneProgress } from './MilestoneProgress';
import { RecommendationsView } from './RecommendationsView';
import { TrainingPlan, TrainingSessionLog } from '../types';
import { AlertService } from '../services/AlertService';
import { getTemplateById } from '../utils/trainingTemplates';

interface TrainingPlanCardProps {
    plan: TrainingPlan;
    sessions: TrainingSessionLog[];
    onAddSession: (planId: string, sessionData: Partial<TrainingSessionLog>) => void;
    onUpdatePlan: (planId: string, updates: Partial<TrainingPlan>) => void;
    onCreateTask: (task: { title: string; description: string; category: string }) => void;
    onDelete: (planId: string) => void;
    onDeleteSession: (sessionId: string) => void;
}

export const TrainingPlanCard: React.FC<TrainingPlanCardProps> = ({
    plan,
    sessions,
    onAddSession,
    onUpdatePlan,
    onCreateTask,
    onDelete,
    onDeleteSession
}) => {
    const { theme } = useTheme();
    const [expanded, setExpanded] = useState(false);
    const [showAddSession, setShowAddSession] = useState(false);
    const [selectedSession, setSelectedSession] = useState<TrainingSessionLog | null>(null);
    const [minutes, setMinutes] = useState('15');
    const [activity, setActivity] = useState('');
    const [notes, setNotes] = useState('');
    const [observedBehaviors, setObservedBehaviors] = useState<string[]>([]);
    const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
    const [sessionOutcome, setSessionOutcome] = useState<'success' | 'struggle'>('success');
    const [treatsUsed, setTreatsUsed] = useState('');

    // Date/Time Selection State
    const [sessionDate, setSessionDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [activeView, setActiveView] = useState<'overview' | 'milestones' | 'recommendations'>('overview');
    const [unreadCount, setUnreadCount] = useState(0);

    // Get template if available (fallback to title match if ID missing)
    const template = (plan.templateId ? getTemplateById(plan.templateId) : null)
        || TRAINING_TEMPLATES.find(t => t.title === plan.title);

    // Calculate this week's sessions
    const now = Date.now();
    const weekStart = now - (7 * 24 * 60 * 60 * 1000);
    const thisWeekSessions = sessions.filter(s => s.date >= weekStart);
    const progress = Math.min((thisWeekSessions.length / plan.sessionsPerWeek) * 100, 100);

    // Calculate current week based on sessions completed
    // Progress to next milestone every 2-3 sessions (more responsive than waiting for full week)
    const totalSessionsCompleted = sessions.length;
    const sessionsPerMilestone = Math.max(2, Math.floor(plan.sessionsPerWeek / 2)); // 2-3 sessions per milestone
    const weeksCompletedBySession = Math.floor(totalSessionsCompleted / sessionsPerMilestone);

    // Also calculate weeks by time elapsed
    useEffect(() => {
        const checkAndFetchUnread = async () => {
            // Proactively generate recommendations if template is available
            // This ensures badges appear before visiting the tab
            if (template) {
                // Calculate current week for generation
                const startDate = new Date(plan.createdAt || Date.now()).getTime();
                const nowTime = new Date().getTime();
                const days = Math.floor((nowTime - startDate) / (1000 * 60 * 60 * 24));
                const week = Math.max(1, Math.floor(days / 7) + 1);

                await generateAIRecommendations(plan.id, sessions, template, week);
            }

            const count = await recommendationRepository.getUnreadCountByPlan(plan.id);
            setUnreadCount(count);
        };
        checkAndFetchUnread();
    }, [plan.id, sessions.length]);

    const planStartDate = plan.createdAt || Date.now();
    const daysSinceStart = Math.floor((now - planStartDate) / (1000 * 60 * 60 * 24));
    const weeksElapsed = Math.floor(daysSinceStart / 7);

    // Current week is the greater of: weeks by sessions OR weeks by time (minimum 1)
    const currentWeek = Math.max(weeksCompletedBySession + 1, weeksElapsed + 1, 1);

    // Calculate current day within the current week (for daily activities)
    // This ensures "Today" tab shows activities appropriate for the current milestone week
    const daysIntoCurrentWeek = daysSinceStart % 7; // 0-6
    const currentDay = ((currentWeek - 1) * 7) + daysIntoCurrentWeek + 1; // Absolute day number aligned with week



    const handleAddSession = () => {
        // Construct activity from selected milestones, or fallback to generic
        const activityName = selectedMilestone || 'Training Session';

        const sessionData: Partial<TrainingSessionLog> = {
            minutes: parseInt(minutes) || 15,
            activity: activityName,
            date: sessionDate.getTime(), // Use selected date
            notes: sessionOutcome === 'success' ? notes : '',
            challengesNotes: sessionOutcome === 'struggle' ? notes : undefined,
            observedBehaviors,
            birdMoodAfter: sessionOutcome === 'success' ? 'happy' : 'frustrated'
        };

        // If treats were used, we should log them to the Diet Log as well
        // We'll pass this via a special property or handle it in the parent?
        // The prompt says "Automatically logging treats...".
        // TrainingSessionLog doesn't have a structured "treats" field yet, but we can add one or just rely on the onAddSession prop to handle it if we modify the signature.
        // Or better, checking the props... `onAddSession: (planId: string, sessionData: Partial<TrainingSessionLog>) => void;`
        // I will add `treatsUsed` to the sessionData. I may need to update the Type definition for TrainingSessionLog.
        // Let's assume I can add it to notes or a new field.
        // For now, I'll append it to notes if no specific field, BUT the requirement is "diet entries".
        // Since `TrainingPlanCard` is a UI component, it shouldn't access Repositories directly if possible to keep it pure?
        // But it already accesses `recommendationRepository`.
        // Ideally the parent `TrainingTab` or `CareTab` should handle the cross-domain logic.
        // However, `TrainingPlanCard` is complex and self-contained.
        // I'll add `treatsUsed` to the callback and let the parent handle the diet logging.
        // But wait, `onAddSession` takes `TrainingSessionLog`.
        // Let's create a side-effect here or modify the interface.
        // I'll modify the interface to accept `treatsUsed` string.

        onAddSession(plan.id, {
            ...sessionData,
            reinforcementType: treatsUsed || undefined
        });

        // Reset form
        setActivity('');
        setNotes('');
        setMinutes('15');
        setTreatsUsed('');
        setObservedBehaviors([]);
        setSelectedMilestone(null);
        setSessionOutcome('success');
        setSessionDate(new Date()); // Reset date to now
        setShowAddSession(false);
    };

    const onChangeDate = (event: any, selectedDate?: Date) => {
        // Only update if a date was actually selected
        if (selectedDate) {
            // Keep time part of sessionDate, update date part
            const newDate = new Date(sessionDate);
            newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            setSessionDate(newDate);
        }
        // Close picker after processing on Android
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
    };

    const onChangeTime = (event: any, selectedDate?: Date) => {
        // Only update if a time was actually selected
        if (selectedDate) {
            // Keep date part of sessionDate, update time part
            const newDate = new Date(sessionDate);
            newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
            setSessionDate(newDate);
        }
        // Close picker after processing on Android
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
    };

    const handleDelete = () => {
        AlertService.confirm(
            'Delete Training Plan',
            `Are you sure you want to delete "${plan.title}"?`,
            () => onDelete(plan.id),
            'Delete'
        );
    };

    const handleDeleteSession = (sessionId: string) => {
        AlertService.confirm(
            'Delete Session',
            'Are you sure you want to delete this session?',
            () => {
                onDeleteSession(sessionId);
                setSelectedSession(null);
            },
            'Delete'
        );
    };

    return (
        <Card style={styles.container}>
            <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <View style={styles.titleRow}>
                            <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                                {template?.icon} {plan.title}
                            </Text>
                        </View>
                        <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                            {plan.goal}
                        </Text>
                        {template && (
                            <View style={styles.metaRow}>
                                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                                    Week {currentWeek} • Day {currentDay}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={[theme.typography.h2, { color: theme.colors.brand.primary }]}>
                        {expanded ? '−' : '+'}
                    </Text>
                </View>

                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
                            This week: {thisWeekSessions.length}/{plan.sessionsPerWeek} sessions
                        </Text>
                        <Text style={[theme.typography.bodySmall, { color: theme.colors.brand.primary, fontWeight: '600' }]}>
                            {progress.toFixed(0)}%
                        </Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${progress}%`,
                                    backgroundColor: theme.colors.brand.primary
                                }
                            ]}
                        />
                    </View>
                </View>
            </TouchableOpacity>

            {expanded && (
                <View style={styles.expandedContent}>
                    {/* Current Phase / Milestone Header - UNIVERSAL */}
                    {template && (() => {
                        const currentMilestone = template.milestones.find(m => m.week === currentWeek) || template.milestones[template.milestones.length - 1]; // Fallback to last if beyond
                        if (currentMilestone) {
                            return (
                                <View style={styles.phaseHeaderContainer}>
                                    <Text style={[theme.typography.h3, { color: theme.colors.brand.primary }]}>
                                        {currentMilestone.title}
                                    </Text>
                                    <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
                                        {currentMilestone.description}
                                    </Text>
                                </View>
                            );
                        }
                        return null;
                    })()}

                    {/* Tab Navigation */}
                    {template && (
                        <View style={styles.tabBar}>
                            <TouchableOpacity
                                style={[styles.tab, activeView === 'overview' && styles.activeTab]}
                                onPress={() => setActiveView('overview')}
                            >
                                <Text style={[
                                    theme.typography.caption,
                                    { color: activeView === 'overview' ? theme.colors.brand.primary : theme.colors.textSecondary }
                                ]}>
                                    Overview
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeView === 'milestones' && styles.activeTab]}
                                onPress={() => setActiveView('milestones')}
                            >
                                <Text style={[
                                    theme.typography.caption,
                                    { color: activeView === 'milestones' ? theme.colors.brand.primary : theme.colors.textSecondary }
                                ]}>
                                    Milestones
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeView === 'recommendations' && styles.activeTab]}
                                onPress={() => setActiveView('recommendations')}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={[
                                        theme.typography.caption,
                                        { color: activeView === 'recommendations' ? theme.colors.brand.primary : theme.colors.textSecondary }
                                    ]}>
                                        Recommendations
                                    </Text>
                                    {unreadCount > 0 && (
                                        <View style={[styles.tabBadge, { backgroundColor: theme.colors.brand.primary }]}>
                                            <Text style={styles.badgeText}>
                                                {unreadCount > 9 ? '9+ new' : `${unreadCount} new`}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Milestone Progress View */}
                    {template && activeView === 'milestones' && (
                        <MilestoneProgress
                            milestones={template.milestones}
                            currentWeek={currentWeek}
                        />
                    )}

                    {/* AI Recommendations View */}
                    {activeView === 'recommendations' && (
                        <RecommendationsView
                            planId={plan.id}
                            sessions={sessions}
                            template={template || null}
                            currentWeek={currentWeek}
                            onUpdatePlan={onUpdatePlan}
                            onCreateTask={onCreateTask}
                        />
                    )}

                    {/* Overview View */}
                    {(!template || activeView === 'overview') && (
                        <>
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                                        {sessions.length}
                                    </Text>
                                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                                        Total Sessions
                                    </Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                                        {sessions.reduce((sum, s) => sum + (parseInt((s.minutes as any)?.minutes || s.minutes) || 0), 0)}
                                    </Text>
                                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                                        Total Minutes
                                    </Text>
                                </View>
                            </View>

                            {/* Recent Sessions History */}
                            {sessions.length > 0 && !showAddSession && (
                                <View style={styles.sessionHistoryContainer}>
                                    <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '600', marginBottom: 12 }]}>
                                        📋 Recent Sessions
                                    </Text>
                                    {sessions.slice(-3).reverse().map((session, index) => (
                                        <TouchableOpacity
                                            key={session.id || index}
                                            style={[
                                                styles.sessionHistoryItem,
                                                {
                                                    backgroundColor: theme.colors.surface,
                                                    borderColor: theme.colors.border,
                                                    marginBottom: index === Math.min(2, sessions.length - 1) ? 0 : 8
                                                }
                                            ]}
                                            onPress={() => setSelectedSession(session)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <Text style={[theme.typography.bodySmall, { color: theme.colors.text, fontWeight: '600' }]}>
                                                    {session.activity || 'Training Session'}
                                                </Text>
                                                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
                                                    {new Date(session.date).toLocaleDateString()} • {parseInt((session.minutes as any)?.minutes || session.minutes) || 0} min
                                                </Text>
                                                {session.notes && (
                                                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4, fontStyle: 'italic' }]} numberOfLines={2}>
                                                        "{session.notes}"
                                                    </Text>
                                                )}
                                            </View>
                                            <Text style={[theme.typography.caption, { color: theme.colors.brand.primary }]}>
                                                View →
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {showAddSession ? (
                                <View style={styles.addSessionForm}>


                                    {/* Current Phase Header - IN FORM */}
                                    {/* Current Phase Header - IN FORM */}
                                    {(() => {
                                        if (template) {
                                            const currentMilestone = template.milestones.find(m => m.week === currentWeek) || template.milestones[0];
                                            return (
                                                <View style={[styles.phaseHeaderContainer, { marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border + '40' }]}>
                                                    <Text style={[theme.typography.h3, { color: theme.colors.brand.primary, marginBottom: 4 }]}>
                                                        {currentMilestone.title}
                                                    </Text>
                                                    <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
                                                        {currentMilestone.description}
                                                    </Text>
                                                </View>
                                            );
                                        } else {
                                            // Fallback when no template
                                            return (
                                                <View style={[styles.phaseHeaderContainer, { marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border + '40' }]}>
                                                    <Text style={[theme.typography.h3, { color: theme.colors.brand.primary, marginBottom: 4 }]}>
                                                        Training Session
                                                    </Text>
                                                    <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
                                                        Log your training progress
                                                    </Text>
                                                </View>
                                            );
                                        }
                                    })()}


                                    {/* Date and Time - Interactive Chips */}
                                    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                                        <TouchableOpacity
                                            onPress={() => setShowDatePicker(true)}
                                            style={[styles.dateTimeChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                                        >
                                            <Text style={{ fontSize: 16 }}>📅</Text>
                                            <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '500' }]}>
                                                {(() => {
                                                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                                    return `${months[sessionDate.getMonth()]} ${sessionDate.getDate()}, ${sessionDate.getFullYear()}`;
                                                })()}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => setShowTimePicker(true)}
                                            style={[styles.dateTimeChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                                        >
                                            <Text style={{ fontSize: 16 }}>⏰</Text>
                                            <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '500' }]}>
                                                {`${sessionDate.getHours().toString().padStart(2, '0')}:${sessionDate.getMinutes().toString().padStart(2, '0')}`}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Web Date/Time Pickers (Hidden but Functional) or Native Modals */}
                                    <AppDateTimePicker
                                        value={sessionDate}
                                        mode="date"
                                        visible={showDatePicker}
                                        onChange={onChangeDate}
                                        onClose={() => setShowDatePicker(false)}
                                    />

                                    <AppDateTimePicker
                                        value={sessionDate}
                                        mode="time"
                                        visible={showTimePicker}
                                        onChange={onChangeTime}
                                        onClose={() => setShowTimePicker(false)}
                                    />

                                    {/* Milestones / Training Steps Checklist - REPLACES ACTIVITY INPUT */}
                                    {template && template.milestones && template.milestones.length > 0 && (
                                        <View style={[styles.sectionContainer, { borderColor: theme.colors.brand.safe + '40', backgroundColor: theme.colors.brand.safe + '05' }]}>
                                            <Text style={[theme.typography.body, { color: theme.colors.text, marginBottom: 8, fontWeight: '600' }]}>
                                                🎯 Today's Focus
                                            </Text>
                                            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 12 }]}>
                                                Select the step you are practicing. Repeat this step over multiple sessions until your parrot masters it.
                                            </Text>
                                            {template.milestones.map((milestone, index) => {
                                                const isSelected = selectedMilestone === milestone.title;
                                                // Calculate how many times this milestone has been logged
                                                const sessionCount = sessions.filter(s => s.activity === milestone.title).length;

                                                return (
                                                    <TouchableOpacity
                                                        key={index}
                                                        style={[
                                                            styles.checklistRow,
                                                            {
                                                                borderBottomColor: theme.colors.border + '40',
                                                                borderBottomWidth: index === template.milestones.length - 1 ? 0 : 1,
                                                                backgroundColor: isSelected ? theme.colors.brand.safe + '15' : 'transparent',
                                                                paddingHorizontal: 8,
                                                                borderRadius: 8
                                                            }
                                                        ]}
                                                        onPress={() => {
                                                            setSelectedMilestone(prev =>
                                                                prev === milestone.title ? null : milestone.title
                                                            );
                                                        }}
                                                    >
                                                        <View style={[
                                                            styles.circleCheckbox,
                                                            {
                                                                borderColor: isSelected ? theme.colors.brand.safe : theme.colors.border,
                                                                backgroundColor: isSelected ? theme.colors.brand.safe : 'transparent'
                                                            }
                                                        ]}>
                                                            {isSelected && <Text style={{ color: 'white', fontSize: 10 }}>✓</Text>}
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Text style={[
                                                                    theme.typography.bodySmall,
                                                                    {
                                                                        color: theme.colors.text,
                                                                        fontWeight: isSelected ? '600' : '500'
                                                                    }
                                                                ]}>
                                                                    {milestone.title}
                                                                </Text>
                                                                {sessionCount > 0 && (
                                                                    <Text style={[theme.typography.caption, { color: theme.colors.brand.primary, fontSize: 10 }]}>
                                                                        {sessionCount} sessions
                                                                    </Text>
                                                                )}
                                                            </View>
                                                            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                                                                {milestone.description}
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    )}


                                    {/* Duration Display - Non-editable visual indicator */}
                                    <View style={[styles.durationDisplay, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                                        <Text style={{ fontSize: 20 }}>⏱️</Text>
                                        <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '600' }]}>
                                            {minutes} min
                                        </Text>
                                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginLeft: 8 }]}>
                                            session duration
                                        </Text>
                                    </View>


                                    {/* Observable Behaviors Checklist - ALWAYS SHOW */}
                                    {(() => {
                                        // Get observables from template, filtered by selected milestone
                                        const allObservables = template?.generalObservables || [];
                                        const observables = allObservables.filter(obs => {
                                            // If no restrictions, always show
                                            if (!obs.relevantMilestones) return true;
                                            // If restricted, only show if current milestone satisfies it
                                            return selectedMilestone && obs.relevantMilestones.includes(selectedMilestone);
                                        });

                                        if (observables.length > 0) {
                                            return (
                                                <View style={styles.observablesContainer}>
                                                    <Text style={[theme.typography.body, { color: theme.colors.text, marginBottom: 12, fontWeight: '600' }]}>
                                                        📝 specific observations
                                                    </Text>
                                                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 12 }]}>
                                                        Check off behaviors you observed during this session
                                                    </Text>
                                                    {observables.map((observable) => {
                                                        const isChecked = observedBehaviors.includes(observable.id);
                                                        const categoryIcon = observable.category === 'milestone' ? '🎯' : observable.category === 'skill' ? '⭐' : '👁️';
                                                        const categoryColor = observable.category === 'milestone' ? theme.colors.brand.safe : observable.category === 'skill' ? theme.colors.brand.brandPurple : theme.colors.brand.brandPurple;

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
                                                                onPress={() => {
                                                                    setObservedBehaviors(prev =>
                                                                        prev.includes(observable.id)
                                                                            ? prev.filter(id => id !== observable.id)
                                                                            : [...prev, observable.id]
                                                                    );
                                                                }}
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
                                                    <View style={[styles.progressIndicator, { backgroundColor: theme.colors.brand.safe + '10', borderColor: theme.colors.brand.safe }]}>
                                                        <Text style={[theme.typography.caption, { color: theme.colors.text, fontWeight: '600' }]}>
                                                            Progress: {observedBehaviors.length}/{observables.length} observed
                                                        </Text>
                                                    </View>
                                                </View>
                                            );
                                        }
                                        return null;
                                    })()}
                                    <View style={{ marginBottom: 16 }}>
                                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 8 }]}>
                                            Treats used (optional)
                                        </Text>
                                        <TextInput
                                            style={[
                                                styles.input,
                                                theme.typography.body,
                                                {
                                                    backgroundColor: theme.colors.background,
                                                    color: theme.colors.text,
                                                    borderColor: theme.colors.border,
                                                    height: 40,
                                                    paddingVertical: 8
                                                }
                                            ]}
                                            value={treatsUsed}
                                            onChangeText={setTreatsUsed}
                                            placeholder="e.g. Sunflower seeds, Apple slices"
                                            placeholderTextColor={theme.colors.textSecondary}
                                        />
                                    </View>

                                    <View style={{ marginBottom: 16 }}>
                                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 8 }]}>
                                            How did it go?
                                        </Text>
                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.toggleButton,
                                                    {
                                                        flex: 1,
                                                        backgroundColor: sessionOutcome === 'success' ? theme.colors.brand.safe : theme.colors.surface,
                                                        borderColor: sessionOutcome === 'success' ? theme.colors.brand.safe : theme.colors.border,
                                                        borderWidth: 1,
                                                        borderRadius: 8,
                                                        padding: 12,
                                                        alignItems: 'center'
                                                    }
                                                ]}
                                                onPress={() => setSessionOutcome('success')}
                                            >
                                                <Text style={[
                                                    theme.typography.body,
                                                    {
                                                        color: sessionOutcome === 'success' ? 'white' : theme.colors.text,
                                                        fontWeight: '600'
                                                    }
                                                ]}>
                                                    👍 Going Well
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[
                                                    styles.toggleButton,
                                                    {
                                                        flex: 1,
                                                        backgroundColor: sessionOutcome === 'struggle' ? theme.colors.brand.toxic : theme.colors.surface,
                                                        borderColor: sessionOutcome === 'struggle' ? theme.colors.brand.toxic : theme.colors.border,
                                                        borderWidth: 1,
                                                        borderRadius: 8,
                                                        padding: 12,
                                                        alignItems: 'center'
                                                    }
                                                ]}
                                                onPress={() => setSessionOutcome('struggle')}
                                            >
                                                <Text style={[
                                                    theme.typography.body,
                                                    {
                                                        color: sessionOutcome === 'struggle' ? 'white' : theme.colors.text,
                                                        fontWeight: '600'
                                                    }
                                                ]}>
                                                    👎 Struggling
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <TextInput
                                        style={[
                                            styles.input,
                                            theme.typography.body,
                                            {
                                                backgroundColor: theme.colors.background,
                                                color: theme.colors.text,
                                                borderColor: sessionOutcome === 'struggle' ? theme.colors.brand.toxic : theme.colors.border,
                                                minHeight: 80
                                            }
                                        ]}
                                        value={notes}
                                        onChangeText={setNotes}
                                        placeholder={sessionOutcome === 'success' ? "Notes (optional)" : "What went wrong? (e.g. bird was ignoring me, bit me...)"}
                                        placeholderTextColor={theme.colors.textSecondary}
                                        multiline
                                    />
                                    {sessionOutcome === 'struggle' && (
                                        <Text style={[theme.typography.caption, { color: theme.colors.brand.toxic, marginTop: 4, marginBottom: 8 }]}>
                                            Tip: Describe the issue to get AI-powered advice!
                                        </Text>
                                    )}
                                    <View style={styles.formButtons}>
                                        <Button title="Add Session" onPress={handleAddSession} style={{ flex: 1, marginRight: 8 }} />
                                        <Button title="Cancel" onPress={() => {
                                            setShowAddSession(false);
                                            setObservedBehaviors([]);
                                        }} variant="secondary" style={{ flex: 1 }} />
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.actionButtons}>
                                    <Button
                                        title="+ Log Session"
                                        onPress={() => setShowAddSession(true)}
                                        style={{ flex: 1, marginRight: 8 }}
                                    />
                                    <TouchableOpacity
                                        onPress={handleDelete}
                                        style={[styles.deleteButton, { borderColor: theme.colors.brand.toxic }]}
                                    >
                                        <Text style={[theme.typography.bodySmall, { color: theme.colors.brand.toxic }]}>
                                            Delete
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    )}
                </View>
            )}

            {/* Session Details Modal */}
            <Modal
                visible={!!selectedSession}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSelectedSession(null)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <View style={[
                        styles.modalContent,
                        {
                            // FORCE SOLID BACKGROUND based on theme
                            backgroundColor: theme.isDark ? '#1F2937' : '#FFFFFF',
                            opacity: 1,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 10,
                            elevation: 10
                        }
                    ]}>
                        <ScrollView>
                            <View style={styles.modalHeader}>
                                <Text style={[theme.typography.h2, { color: theme.colors.text, flex: 1 }]}>
                                    Session Details
                                </Text>
                                <TouchableOpacity onPress={() => setSelectedSession(null)}>
                                    <Text style={[theme.typography.h2, { color: theme.colors.brand.primary }]}>
                                        ✕
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {selectedSession && (
                                <>
                                    <View style={[styles.modalSection, { borderColor: theme.colors.border }]}>
                                        <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '600', marginBottom: 8 }]}>
                                            {selectedSession.activity || 'Training Session'}
                                        </Text>
                                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                                            {new Date(selectedSession.date).toLocaleDateString()} • {parseInt((selectedSession.minutes as any)?.minutes || selectedSession.minutes) || 0} minutes
                                        </Text>
                                    </View>

                                    {selectedSession.notes && (
                                        <View style={[styles.modalSection, { borderColor: theme.colors.border }]}>
                                            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, fontWeight: '600', marginBottom: 4 }]}>
                                                Notes
                                            </Text>
                                            <Text style={[theme.typography.body, { color: theme.colors.text }]}>
                                                {selectedSession.notes}
                                            </Text>
                                        </View>
                                    )}

                                    {selectedSession.observedBehaviors && selectedSession.observedBehaviors.length > 0 && (
                                        <View style={[styles.modalSection, { borderColor: theme.colors.border }]}>
                                            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, fontWeight: '600', marginBottom: 8 }]}>
                                                Observed Behaviors ({selectedSession.observedBehaviors.length})
                                            </Text>
                                            {selectedSession.observedBehaviors.map((behaviorId, idx) => {
                                                const observable = template?.generalObservables?.find(o => o.id === behaviorId);
                                                return (
                                                    <View key={idx} style={{ flexDirection: 'row', marginBottom: 6 }}>
                                                        <Text style={[theme.typography.bodySmall, { color: theme.colors.brand.safe, marginRight: 8 }]}>✓</Text>
                                                        <Text style={[theme.typography.bodySmall, { color: theme.colors.text, flex: 1 }]}>
                                                            {observable?.description || behaviorId}
                                                        </Text>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    )}

                                    {selectedSession.completedMilestones && selectedSession.completedMilestones.length > 0 && (
                                        <View style={[styles.modalSection, { borderColor: theme.colors.border }]}>
                                            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, fontWeight: '600', marginBottom: 8 }]}>
                                                Completed Milestones ({selectedSession.completedMilestones.length})
                                            </Text>
                                            {selectedSession.completedMilestones.map((milestone, idx) => (
                                                <View key={idx} style={{ flexDirection: 'row', marginBottom: 6 }}>
                                                    <Text style={[theme.typography.bodySmall, { color: theme.colors.brand.safe, marginRight: 8 }]}>🎯</Text>
                                                    <Text style={[theme.typography.bodySmall, { color: theme.colors.text, flex: 1 }]}>
                                                        {milestone}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {(selectedSession.attempts || selectedSession.successes) && (
                                        <View style={[styles.modalSection, { borderColor: theme.colors.border }]}>
                                            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, fontWeight: '600', marginBottom: 8 }]}>
                                                Performance
                                            </Text>
                                            <View style={{ flexDirection: 'row', gap: 16 }}>
                                                {selectedSession.attempts && (
                                                    <View>
                                                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Attempts</Text>
                                                        <Text style={[theme.typography.body, { color: theme.colors.text }]}>{selectedSession.attempts}</Text>
                                                    </View>
                                                )}
                                                {selectedSession.successes && (
                                                    <View>
                                                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Successes</Text>
                                                        <Text style={[theme.typography.body, { color: theme.colors.text }]}>{selectedSession.successes}</Text>
                                                    </View>
                                                )}
                                                {selectedSession.successRate && (
                                                    <View>
                                                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Success Rate</Text>
                                                        <Text style={[theme.typography.body, { color: theme.colors.brand.safe }]}>{selectedSession.successRate}%</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        style={{ marginTop: 24, padding: 16, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: theme.colors.brand.toxic }}
                                        onPress={() => handleDeleteSession(selectedSession.id)}
                                    >
                                        <Text style={{ color: theme.colors.brand.toxic, fontWeight: '600' }}>Delete Session</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaRow: {
        marginTop: 6,
    },
    progressSection: {
        marginTop: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    expandedContent: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128, 64, 191, 0.1)',
    },
    tabBar: {
        flexDirection: 'row',
        marginBottom: 16,
        backgroundColor: 'rgba(128, 64, 191, 0.05)',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabBadge: {
        marginLeft: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    activeTab: {
        backgroundColor: '#FFFFFF',
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'rgba(128, 64, 191, 0.05)',
        borderRadius: 12,
    },
    addSessionForm: {
        gap: 12,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
    },
    dateTimeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    durationDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
        gap: 8,
    },
    formButtons: {
        flexDirection: 'row',
        marginTop: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteButton: {
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    observablesContainer: {
        marginVertical: 12,
        padding: 12,
        backgroundColor: 'rgba(128, 64, 191, 0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(128, 64, 191, 0.2)',
    },
    dateTimeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1,
        gap: 8,
    },
    sectionContainer: {
        marginBottom: 16,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    checklistRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        gap: 12,
    },
    circleCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    observableItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        borderWidth: 2,
        marginBottom: 8,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    observableHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryIcon: {
        fontSize: 16,
    },
    progressIndicator: {
        padding: 10,
        borderRadius: 8,
        marginTop: 8,
        borderWidth: 2,
        alignItems: 'center',
    },
    phaseHeaderContainer: {
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sessionHistoryContainer: {
        marginTop: 16,
        marginBottom: 16,
    },
    sessionHistoryItem: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalSection: {
        paddingBottom: 16,
        marginBottom: 16,
        borderBottomWidth: 1,
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    }
});

