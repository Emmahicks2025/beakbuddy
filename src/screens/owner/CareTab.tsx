import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl, Alert, Modal, Platform, Image, SafeAreaView, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { useProfileContext } from '../../context/ProfileContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ProgressCard } from '../../components/ProgressCard';
import { StatBadge } from '../../components/StatBadge';
import { TaskItem } from '../../components/TaskItem';
import { TrainingPlanCard } from '../../components/TrainingPlanCard';
import { DietPieChart } from '../../components/DietPieChart';
import { TrainingTemplateCard } from '../../components/TrainingTemplateCard';
import { TrainingWizard } from '../../components/TrainingWizard';
import { TaskCalendarView } from '../../components/TaskCalendarView';
import { TrainingInsights } from '../../components/TrainingInsights';
import { FoodLookup } from '../../components/FoodLookup';
import { GlassIcon } from '../../components/GlassIcon';
import { AlertService } from '../../services/AlertService';
import SubscriptionService from '../../services/subscriptionService';
import {
    ProfileRepository,
    TrainingPlanRepository,
    TrainingSessionRepository,
    DietPlanRepository,
    CareTaskRepository,
    CareTaskHistoryRepository,
    DietLogRepository
} from '../../database/repository';
import { ParrotProfile, TrainingPlan, TrainingSessionLog, DietPlan, CareTask, CareTaskHistory, DietLog } from '../../types';
import { TRAINING_TEMPLATES, TrainingTemplate } from '../../utils/trainingTemplates';
import { NotificationService } from '../../services/notificationService';
import { RecommendationsView } from '../../components/RecommendationsView';

const CareTab: React.FC = () => {
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    const { activeProfile, isLoading: profileLoading } = useProfileContext();
    const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
    const [sessions, setSessions] = useState<TrainingSessionLog[]>([]);
    const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
    const [careTasks, setCareTasks] = useState<CareTask[]>([]);
    const [taskHistory, setTaskHistory] = useState<CareTaskHistory[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<'overview' | 'training' | 'diet' | 'tasks' | 'insights'>('overview');
    const [activeModal, setActiveModal] = useState<'meal' | 'task_form' | null>(null);
    const [isPro, setIsPro] = useState(false); // Default to false for security/safety

    // Task form
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskSchedule, setNewTaskSchedule] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

    const [editingDiet, setEditingDiet] = useState(false);
    const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
    const [newMealItems, setNewMealItems] = useState('');
    const [newMealNotes, setNewMealNotes] = useState('');



    // Initial Data
    const [pelletsPercent, setPelletsPercent] = useState(60);
    const [veggiesPercent, setVeggiesPercent] = useState(25);
    const [fruitsPercent, setFruitsPercent] = useState(8);
    const [seedsPercent, setSeedsPercent] = useState(2);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        if (activeProfile) {
            const p = activeProfile;

            const [plans, allSessions, diet, tasks, history, logs] = await Promise.all([
                TrainingPlanRepository.getByProfile(p.id),
                TrainingSessionRepository.getByProfile(p.id),
                DietPlanRepository.getByProfile(p.id),
                CareTaskRepository.getByProfile(p.id),
                CareTaskHistoryRepository.getByProfile(p.id),
                DietLogRepository.getByProfile(p.id)
            ]);

            setTrainingPlans(plans);
            setSessions(allSessions);

            if (!diet) {
                // Create default diet plan
                await DietPlanRepository.createOrUpdate({
                    profileId: p.id,
                    pelletsPercent: 65,
                    veggiesPercent: 25,
                    fruitsPercent: 8,
                    seedsPercent: 2,
                    notes: 'Recommended balanced diet'
                });
                const newDiet = await DietPlanRepository.getByProfile(p.id);
                setDietPlan(newDiet);
            } else {
                setDietPlan(diet);
                setPelletsPercent(diet.pelletsPercent);
                setVeggiesPercent(diet.veggiesPercent);
                setFruitsPercent(diet.fruitsPercent);
                setSeedsPercent(diet.seedsPercent);
            }

            setDietLogs(logs);
            setCareTasks(tasks);
            setTaskHistory(history);

            // Create default tasks if none exist
            if (tasks.length === 0) {
                await CareTaskRepository.create({ profileId: p.id, title: 'Clean cage', schedule: 'Daily' });
                await CareTaskRepository.create({ profileId: p.id, title: 'Fresh water', schedule: 'Daily' });
                await CareTaskRepository.create({ profileId: p.id, title: 'Playtime', schedule: 'Daily' });
                await CareTaskRepository.create({ profileId: p.id, title: 'Vet checkup', schedule: 'Monthly' });
                // Reload tasks after creation
                const updatedTasks = await CareTaskRepository.getByProfile(p.id);
                setCareTasks(updatedTasks);
            }
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };


    const handleAddSession = async (planId: string, sessionData: Partial<TrainingSessionLog>) => {
        if (!activeProfile) return;

        await TrainingSessionRepository.create({
            ...sessionData,
            profileId: activeProfile.id,
            planId,
            date: sessionData.date || Date.now(),
            minutes: typeof sessionData.minutes === 'number' ? sessionData.minutes : parseInt(sessionData.minutes as any) || 0,
            activity: sessionData.activity || 'Training Session',
            notes: sessionData.notes || ''
        });

        // Automatically log treats to diet log if provided
        if (sessionData.reinforcementType) {
            const treats = sessionData.reinforcementType.split(',').map(s => s.trim()).filter(s => s.length > 0);
            if (treats.length > 0) {
                await DietLogRepository.create({
                    profileId: activeProfile.id,
                    date: sessionData.date || Date.now(),
                    items: treats,
                    notes: `Training treats from ${sessionData.activity || 'session'}`
                });
            }
        }

        loadData();
    };

    const handleDeleteSession = async (sessionId: string) => {
        await TrainingSessionRepository.delete(sessionId);
        loadData();
    };

    const handleDeletePlan = async (planId: string) => {
        await TrainingPlanRepository.delete(planId);
        loadData();
    };

    const handleUpdatePlan = async (planId: string, updates: Partial<TrainingPlan>) => {
        await TrainingPlanRepository.update(planId, updates);
        loadData();
    };

    const handleQuickCreateTask = async (task: { title: string; description: string; category: string }) => {
        if (!activeProfile) return;

        await CareTaskRepository.create({
            profileId: activeProfile.id,
            title: task.title,
            schedule: 'Daily',
        });

        AlertService.alert('Task Created', `Added "${task.title}" to your tasks.`);
        loadData();
    };

    const handleToggleTask = async (taskId: string) => {
        await CareTaskRepository.toggleDone(taskId);
        loadData();
    };

    const handleDeleteTask = async (taskId: string) => {
        await CareTaskRepository.delete(taskId);
        loadData();
    };

    const handleAddTask = async () => {
        if (!activeProfile || !newTaskTitle.trim()) {
            AlertService.alert('Error', 'Please enter a task title');
            return;
        }

        await CareTaskRepository.create({
            profileId: activeProfile.id,
            title: newTaskTitle.trim(),
            schedule: newTaskSchedule
        });

        setNewTaskTitle('');
        setActiveModal(null);
        loadData();
    };

    const handleAddNewTaskFromCalendar = async (taskData: { title: string, schedule: string, dueDate: number }) => {
        if (!activeProfile) return;
        try {
            await CareTaskRepository.create({
                profileId: activeProfile.id,
                title: taskData.title,
                schedule: taskData.schedule as any,
            });
            loadData();
        } catch (e) {
            console.error('Failed to create task:', e);
            AlertService.alert('Error', 'Could not save the task. Please try again.');
        }
    };

    const handleLogTask = async (taskId: string, date: string, time: string, notes: string) => {
        if (!activeProfile) return;
        await CareTaskHistoryRepository.create({
            profileId: activeProfile.id,
            taskId,
            date,
            time,
            notes,
            timestamp: Date.now()
        });
        loadData();
    };

    const handleSetReminder = async (taskId: string, time: string) => {
        const task = careTasks.find(t => t.id === taskId);
        if (!task) return;

        const hasPermission = await NotificationService.requestPermissions();
        if (hasPermission) {
            await NotificationService.scheduleDailyReminder(
                taskId,
                `Time for ${task.title}!`,
                `It's ${time}! Don't forget to ${task.title.toLowerCase()}.`,
                time
            );

            await CareTaskRepository.update(taskId, { reminderTime: time });
            AlertService.alert('Reminder Set', `Daily reminder set for ${time}`);
            loadData();
        } else {
            AlertService.alert('Permission Denied', 'Please enable notifications in settings to use reminders.');
        }
    };

    const handleSaveDiet = async () => {
        if (!activeProfile) return;

        const total = pelletsPercent + veggiesPercent + fruitsPercent + seedsPercent;
        if (total !== 100) {
            AlertService.alert('Error', `Percentages must add up to 100% (currently ${total}%)`);
            return;
        }

        await DietPlanRepository.createOrUpdate({
            profileId: activeProfile.id,
            pelletsPercent,
            veggiesPercent,
            fruitsPercent,
            seedsPercent,
            notes: 'Custom diet plan'
        });

        setEditingDiet(false);
        loadData();
    };

    const handleLogMeal = async () => {
        if (!activeProfile) return;
        if (!newMealItems.trim()) {
            AlertService.alert('Error', 'Please enter at least one food item');
            return;
        }

        await DietLogRepository.create({
            profileId: activeProfile.id,
            date: Date.now(),
            items: newMealItems.split(',').map(s => s.trim()).filter(s => s.length > 0),
            notes: newMealNotes
        });

        setNewMealItems('');
        setNewMealNotes('');
        setActiveModal(null);
        loadData();
    };

    const handleDeleteDietLog = (id: string) => {
        const performDelete = async () => {
            await DietLogRepository.delete(id);
            loadData();
        };

        AlertService.confirm(
            'Delete Meal Log',
            'Are you sure you want to delete this meal log?',
            performDelete,
            'Delete'
        );
    };

    // Calculate stats
    const tasksCompletedToday = careTasks.filter(t => {
        if (!t.isDone || !t.lastDoneAt) return false;
        const today = new Date().setHours(0, 0, 0, 0);
        return t.lastDoneAt >= today;
    }).length;

    const totalTasksToday = careTasks.filter(t => t.schedule === 'Daily').length || 1;
    const weekStart = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const thisWeekSessions = sessions.filter(s => s.date >= weekStart).length;
    const targetSessions = trainingPlans.reduce((sum, p) => sum + p.sessionsPerWeek, 0);
    const maxStreak = careTasks.reduce((max, task) => Math.max(max, task.streak || 0), 0);

    if (!activeProfile && !profileLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Card style={styles.centerCard}>
                    <Text style={[theme.typography.body, { color: theme.colors.text }]}>
                        Create a parrot profile first
                    </Text>
                </Card>
            </View>
        );
    }

    if (profileLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.brand.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Glassy Top Tab Navigation */}
            <View style={styles.topTabContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.topTabScroll}
                >
                    {(['overview', 'training', 'diet', 'tasks', 'insights'] as const).map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.topTabItem,
                                activeTab === tab && {
                                    backgroundColor: theme.colors.brand.primary,
                                }
                            ]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[
                                theme.typography.bodySmall,
                                {
                                    color: activeTab === tab ? '#FFFFFF' : theme.colors.textSecondary,
                                    fontWeight: '700'
                                }
                            ]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={{ position: 'absolute', bottom: 4, right: 8, opacity: 0.3, zIndex: 0 }}>
                <Text style={{ fontSize: 10, color: theme.colors.textSecondary }}>v1.1.0-62 (Web)</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.content}>
                    {activeTab === 'overview' && (
                        <>
                            <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 16 }]}>
                                Today's Overview
                            </Text>

                            <View style={styles.statsGrid}>
                                <StatBadge
                                    icon="✓"
                                    value={tasksCompletedToday}
                                    label="Tasks Done"
                                    color={theme.colors.brand.safe}
                                />
                                <StatBadge
                                    icon="🔥"
                                    value={maxStreak}
                                    label="Streak"
                                    color={theme.colors.brand.primary}
                                />
                            </View>

                            <ProgressCard
                                title="Daily Tasks"
                                current={tasksCompletedToday}
                                target={totalTasksToday}
                                unit="tasks"
                                color={theme.colors.brand.safe}
                            />

                            <ProgressCard
                                title="Weekly Training"
                                current={thisWeekSessions}
                                target={targetSessions}
                                unit="sessions"
                                color={theme.colors.brand.primary}
                            />

                            <Card style={styles.quickActionsCard}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 }}>
                                    <GlassIcon emoji="⚡" size={20} variant="accent" />
                                    <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                                        Quick Actions
                                    </Text>
                                </View>
                                <Button
                                    title="➕ Add Training Plan"
                                    onPress={() => {
                                        setActiveTab('training');
                                        const activeTemplateIds = trainingPlans.map(p => p.templateId).filter(Boolean);
                                        navigation.navigate('TrainingTemplateSelection', { activeTemplateIds });
                                    }}
                                    variant="secondary"
                                    style={{ marginBottom: 12 }}
                                />

                                <Button
                                    title="➕ Add Care Task"
                                    onPress={() => { setActiveTab('tasks'); setActiveModal('task_form'); }}
                                    variant="secondary"
                                />

                                {trainingPlans.length === 0 && (
                                    <View style={{ marginTop: 16, padding: 16, borderRadius: 12, backgroundColor: theme.colors.brand.primary + '10', borderWidth: 1, borderColor: theme.colors.brand.primary + '20', borderStyle: 'dashed' }}>
                                        <Text style={[theme.typography.bodySmall, { color: theme.colors.text, fontWeight: '600', marginBottom: 4 }]}>
                                            No training program active 🎯
                                        </Text>
                                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 12 }]}>
                                            Start a guided program like Potty Training or Recall to see progress here.
                                        </Text>
                                        <Button
                                            title="Browse Programs"
                                            onPress={() => {
                                                setActiveTab('training');
                                                const activeTemplateIds = trainingPlans.map(p => p.templateId).filter(Boolean);
                                                navigation.navigate('TrainingTemplateSelection', { activeTemplateIds });
                                            }}
                                            variant="secondary"
                                            size="small"
                                        />
                                    </View>
                                )}
                            </Card>
                        </>
                    )}

                    {activeTab === 'training' && (
                        <>
                            <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 16 }]}>Training Plans</Text>

                            {trainingPlans.length === 0 && (
                                <Card style={styles.emptyCard}>
                                    <Text style={[theme.typography.h3, { color: theme.colors.brand.primary, textAlign: 'center', marginBottom: 8 }]}>🎯 Start Your First Program</Text>
                                    <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 16 }]}>Choose a template to get guided activities and milestones.</Text>
                                    <Button
                                        title="Browse Templates"
                                        onPress={() => {
                                            const activeTemplateIds = trainingPlans.map(p => p.templateId).filter(Boolean);
                                            navigation.navigate('TrainingTemplateSelection', { activeTemplateIds });
                                        }}
                                        size="small"
                                    />
                                </Card>
                            )}

                            {trainingPlans.map(plan => (
                                <TrainingPlanCard
                                    key={plan.id}
                                    plan={plan}
                                    sessions={sessions.filter(s => s.planId === plan.id)}
                                    onAddSession={handleAddSession}
                                    onUpdatePlan={handleUpdatePlan}
                                    onDelete={handleDeletePlan}
                                    onDeleteSession={handleDeleteSession}
                                    onCreateTask={handleQuickCreateTask}
                                />
                            ))}

                            <Button
                                title="+ Browse Templates"
                                onPress={() => {
                                    const activeTemplateIds = trainingPlans.map(p => p.templateId).filter(Boolean);
                                    navigation.navigate('TrainingTemplateSelection', { activeTemplateIds });
                                }}
                                variant="secondary"
                            />
                        </>
                    )}

                    {activeTab === 'diet' && (
                        <>
                            <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 16 }]}>Food Safety & Diet</Text>
                            <FoodLookup onSelect={(item) => {
                                if (item.verdict === 'TOXIC') {
                                    AlertService.alert('Warning', `${item.name} is toxic!`);
                                    return;
                                }
                                setNewMealItems(prev => prev ? `${prev}, ${item.name}` : item.name);
                                setActiveModal('meal');
                            }} />

                            <Card style={styles.dietCard}>
                                <DietPieChart
                                    pelletsPercent={pelletsPercent}
                                    veggiesPercent={veggiesPercent}
                                    fruitsPercent={fruitsPercent}
                                    seedsPercent={seedsPercent}
                                />
                                {editingDiet ? (
                                    <View style={styles.dietEditForm}>
                                        <View style={styles.sliderRow}>
                                            <Text style={[theme.typography.body, { flex: 1 }]}>Pellets</Text>
                                            <TextInput
                                                style={[styles.percentInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                                                value={pelletsPercent.toString()}
                                                onChangeText={(v) => setPelletsPercent(parseInt(v) || 0)}
                                                keyboardType="number-pad"
                                            />
                                            <Text>%</Text>
                                        </View>
                                        <View style={styles.sliderRow}>
                                            <Text style={[theme.typography.body, { flex: 1 }]}>Vegetables</Text>
                                            <TextInput
                                                style={[styles.percentInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                                                value={veggiesPercent.toString()}
                                                onChangeText={(v) => setVeggiesPercent(parseInt(v) || 0)}
                                                keyboardType="number-pad"
                                            />
                                            <Text>%</Text>
                                        </View>
                                        <View style={styles.sliderRow}>
                                            <Text style={[theme.typography.body, { flex: 1 }]}>Fruits</Text>
                                            <TextInput
                                                style={[styles.percentInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                                                value={fruitsPercent.toString()}
                                                onChangeText={(v) => setFruitsPercent(parseInt(v) || 0)}
                                                keyboardType="number-pad"
                                            />
                                            <Text>%</Text>
                                        </View>
                                        <View style={styles.sliderRow}>
                                            <Text style={[theme.typography.body, { flex: 1 }]}>Seeds</Text>
                                            <TextInput
                                                style={[styles.percentInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                                                value={seedsPercent.toString()}
                                                onChangeText={(v) => setSeedsPercent(parseInt(v) || 0)}
                                                keyboardType="number-pad"
                                            />
                                            <Text>%</Text>
                                        </View>
                                        <View style={styles.formButtons}>
                                            <Button title="Save" onPress={handleSaveDiet} style={{ flex: 1, marginRight: 8 }} />
                                            <Button title="Cancel" onPress={() => setEditingDiet(false)} variant="secondary" style={{ flex: 1 }} />
                                        </View>
                                    </View>
                                ) : (
                                    <Button title="Adjust Targets" onPress={() => setEditingDiet(true)} variant="secondary" style={{ marginTop: 16 }} />
                                )}
                            </Card>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 }}>
                                <Text style={theme.typography.h2}>Meal Logs</Text>
                                <Button title="+ Log Meal" onPress={() => setActiveModal('meal')} size="small" />
                            </View>

                            {dietLogs.map(log => (
                                <Card key={log.id} style={{ marginBottom: 12 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={theme.typography.bodySmall}>{new Date(log.date).toLocaleDateString()}</Text>
                                        <TouchableOpacity onPress={() => handleDeleteDietLog(log.id)}>
                                            <Text style={{ color: theme.colors.brand.toxic }}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={theme.typography.body}>{log.items.join(', ')}</Text>
                                </Card>
                            ))}
                        </>
                    )}

                    {activeTab === 'tasks' && (
                        <>
                            <TaskCalendarView
                                tasks={careTasks}
                                history={taskHistory}
                                onLogTask={handleLogTask}
                                onSetReminder={handleSetReminder}
                                onToggleTask={handleToggleTask}
                                onAddTask={handleAddNewTaskFromCalendar}
                                theme={theme}
                            />
                        </>
                    )}

                    {activeTab === 'insights' && (
                        <View>
                            {!isPro ? (
                                <Card style={{ padding: 32, alignItems: 'center', backgroundColor: theme.colors.brand.primary + '10' }}>
                                    <View style={{ marginBottom: 16 }}>
                                        <GlassIcon emoji="📊" size={60} variant="accent" />
                                    </View>
                                    <Text style={[theme.typography.h2, { textAlign: 'center', marginBottom: 8 }]}>Unlock Weekly Insights</Text>
                                    <Text style={[theme.typography.body, { textAlign: 'center', color: theme.colors.textSecondary, marginBottom: 24 }]}>
                                        Get AI-powered recommendations based on your parrot's training progress and diet history.
                                    </Text>
                                    <Button
                                        title="Start Free Trial"
                                        onPress={() => navigation.navigate('Subscription')}
                                        style={{ width: '100%' }}
                                    />
                                </Card>
                            ) : trainingPlans.length > 0 ? (
                                trainingPlans.map(plan => {
                                    const planSessions = sessions.filter(s => s.planId === plan.id);

                                    // Calculate current week
                                    const now = Date.now();
                                    const totalSessionsCompleted = planSessions.length;
                                    const sessionsPerMilestone = Math.max(2, Math.floor(plan.sessionsPerWeek / 2));
                                    const weeksCompletedBySession = Math.floor(totalSessionsCompleted / sessionsPerMilestone);
                                    const daysSinceStart = Math.floor((now - plan.createdAt) / (1000 * 60 * 60 * 24));
                                    const weeksElapsed = Math.floor(daysSinceStart / 7);
                                    const currentWeek = Math.max(weeksCompletedBySession + 1, weeksElapsed + 1, 1);

                                    const template = TRAINING_TEMPLATES.find(t => t.id === plan.templateId) || null;

                                    return (
                                        <View key={plan.id} style={{ marginBottom: 24 }}>
                                            <Text style={[theme.typography.h3, { marginBottom: 12 }]}>{plan.title} Insights</Text>
                                            <RecommendationsView
                                                planId={plan.id}
                                                sessions={planSessions}
                                                template={template}
                                                currentWeek={currentWeek}
                                                onUpdatePlan={handleUpdatePlan}
                                                onCreateTask={handleQuickCreateTask}
                                            />
                                        </View>
                                    );
                                })
                            ) : (
                                <Card style={{ padding: 32, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 40, marginBottom: 16 }}>🎯</Text>
                                    <Text style={[theme.typography.h3, { textAlign: 'center', marginBottom: 8 }]}>No Training Plans Yet</Text>
                                    <Text style={[theme.typography.body, { textAlign: 'center', color: theme.colors.textSecondary }]}>
                                        Start a training plan to see intelligent insights and recommendations.
                                    </Text>
                                </Card>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Meal Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={activeModal === 'meal'}
                onRequestClose={() => setActiveModal(null)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
                        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 }]}>
                            <Card>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={theme.typography.h2}>Log Meal</Text>
                            <TouchableOpacity onPress={() => setActiveModal(null)}>
                                <Text style={{ fontSize: 24, color: theme.colors.text }}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginBottom: 8 }]}>Food Items (comma separated)</Text>
                        <TextInput
                            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                            value={newMealItems}
                            onChangeText={setNewMealItems}
                            placeholder="e.g. Apple, Pellets"
                            placeholderTextColor={theme.colors.textSecondary}
                        />

                        <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginBottom: 8 }]}>Notes</Text>
                        <TextInput
                            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                            value={newMealNotes}
                            onChangeText={setNewMealNotes}
                            placeholder="Optional notes..."
                            placeholderTextColor={theme.colors.textSecondary}
                        />

                            <Button title="Save Log" onPress={handleLogMeal} />
                        </Card>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            </Modal>

            {/* Task Form Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={activeModal === 'task_form'}
                onRequestClose={() => setActiveModal(null)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
                        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 }]}>
                            <Card>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={theme.typography.h2}>Add Task</Text>
                            <TouchableOpacity onPress={() => setActiveModal(null)}>
                                <Text style={{ fontSize: 24, color: theme.colors.text }}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                            value={newTaskTitle}
                            onChangeText={setNewTaskTitle}
                            placeholder="Task Title (e.g. Clean Cage)"
                            placeholderTextColor={theme.colors.textSecondary}
                        />

                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                            {(['Daily', 'Weekly', 'Monthly'] as const).map(option => (
                                <TouchableOpacity
                                    key={option}
                                    onPress={() => setNewTaskSchedule(option)}
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 8,
                                        borderRadius: 20,
                                        backgroundColor: newTaskSchedule === option ? theme.colors.brand.primary : 'rgba(255,255,255,0.1)',
                                    }}
                                >
                                    <Text style={{ color: newTaskSchedule === option ? '#FFF' : theme.colors.text }}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                            <Button title="Create Task" onPress={handleAddTask} />
                        </Card>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            </Modal>

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    topTabContainer: {
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    topTabScroll: {
        paddingHorizontal: 8,
        gap: 8,
    },
    topTabItem: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    scrollView: { flex: 1 },
    content: { padding: 16 },
    centerCard: { margin: 24, padding: 24, alignItems: 'center' },
    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    quickActionsCard: { padding: 20, marginTop: 12 },
    modalContainer: { flex: 1 },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)'
    },
    modalContent: { flex: 1, padding: 20 },
    emptyCard: { padding: 32, marginBottom: 16, alignItems: 'center' },
    dietCard: { padding: 20, marginBottom: 16 },
    dietEditForm: { marginTop: 20, gap: 16 },
    sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    percentInput: { width: 60, borderWidth: 1, borderRadius: 12, padding: 10, textAlign: 'center' },
    formButtons: { flexDirection: 'row', marginTop: 16, gap: 8 },
    formCard: { padding: 20, marginTop: 16 },
    input: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.3)'
    },
    fabContainer: {
        // Removed local FAB styles
    },
    largeCloseButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
});

export default CareTab;
