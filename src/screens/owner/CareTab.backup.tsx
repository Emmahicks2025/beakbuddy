import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl, Alert, Modal } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
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
import { AppTour } from '../../components/AppTour';
import { FoodLookup } from '../../components/FoodLookup';
import { recommendationRepository } from '../../database/recommendationRepository';
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
import { TRAINING_TEMPLATES, TrainingTemplate, getTemplateById } from '../../utils/trainingTemplates';
import { AIChatModal } from '../../components/AIChatModal';
import { AppContext } from '../../services/aiChat'; // Import AppContext type
import { Ionicons } from '@expo/vector-icons';
import { NotificationService } from '../../services/notificationService';

const CareTab: React.FC = () => {
    const { theme } = useTheme();
    const [profile, setProfile] = useState<ParrotProfile | null>(null);
    const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
    const [sessions, setSessions] = useState<TrainingSessionLog[]>([]);
    const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
    const [careTasks, setCareTasks] = useState<CareTask[]>([]);
    const [taskHistory, setTaskHistory] = useState<CareTaskHistory[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'training' | 'diet' | 'tasks' | 'insights'>('overview');

    // Training plan - template based
    const [showTemplateSelection, setShowTemplateSelection] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<TrainingTemplate | null>(null);
    const [showWizard, setShowWizard] = useState(false);

    // Task form
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskSchedule, setNewTaskSchedule] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

    const [editingDiet, setEditingDiet] = useState(false);
    const [dietLogs, setDietLogs] = useState<DietLog[]>([]);
    const [showLogMeal, setShowLogMeal] = useState(false);
    const [newMealItems, setNewMealItems] = useState('');
    const [newMealNotes, setNewMealNotes] = useState('');

    // AI Chat State
    const [showAIChat, setShowAIChat] = useState(false);

    // Initial Data
    const [pelletsPercent, setPelletsPercent] = useState(60);
    const [veggiesPercent, setVeggiesPercent] = useState(25);
    const [fruitsPercent, setFruitsPercent] = useState(8);
    const [seedsPercent, setSeedsPercent] = useState(2);

    // Onboarding and Badges
    const [showTour, setShowTour] = useState(false);
    const [unreadRecCount, setUnreadRecCount] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const profiles = await ProfileRepository.getAll();
        if (profiles.length > 0) {
            const p = profiles[0];
            setProfile(p);

            // Fetch unread recommendations for badge
            const recommendations = await recommendationRepository.getActiveByPlan('');
            const plans = await TrainingPlanRepository.getByProfile(p.id);
            setTrainingPlans(plans);

            let totalUnread = 0;
            for (const plan of plans) {
                const count = await recommendationRepository.getUnreadCountByPlan(plan.id);
                totalUnread += count;
            }
            setUnreadRecCount(totalUnread);

            // Check if tour should be shown
            const hasSeenTour = localStorage.getItem('app-tour-seen');
            if (!hasSeenTour) {
                setShowTour(true);
                localStorage.setItem('app-tour-seen', 'true');
            }

            const allSessions = await TrainingSessionRepository.getByProfile(p.id);
            setSessions(allSessions);

            let diet = await DietPlanRepository.getByProfile(p.id);
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
                diet = await DietPlanRepository.getByProfile(p.id);
            }
            setDietPlan(diet);
            if (diet) {
                setPelletsPercent(diet.pelletsPercent);
                setVeggiesPercent(diet.veggiesPercent);
                setFruitsPercent(diet.fruitsPercent);
                setSeedsPercent(diet.seedsPercent);
            }

            const logs = await DietLogRepository.getByProfile(p.id);
            setDietLogs(logs);

            const tasks = await CareTaskRepository.getByProfile(p.id);
            setCareTasks(tasks);

            const history = await CareTaskHistoryRepository.getByProfile(p.id);
            setTaskHistory(history);

            // Create default tasks if none exist
            if (tasks.length === 0) {
                await CareTaskRepository.create({ profileId: p.id, title: 'Clean cage', schedule: 'Daily' });
                await CareTaskRepository.create({ profileId: p.id, title: 'Fresh water', schedule: 'Daily' });
                await CareTaskRepository.create({ profileId: p.id, title: 'Playtime', schedule: 'Daily' });
                await CareTaskRepository.create({ profileId: p.id, title: 'Vet checkup', schedule: 'Monthly' });
                loadData();
            }
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    // ... (Training Plan handlers remain same) ...
    const handleSelectTemplate = (template: TrainingTemplate) => {
        setSelectedTemplate(template);
        setShowTemplateSelection(false);
        setShowWizard(true);
    };

    const handleWizardComplete = async (planData: { title: string; goal: string; sessionsPerWeek: number; templateId: string }) => {
        if (!profile) return;

        await TrainingPlanRepository.create({
            profileId: profile.id,
            title: planData.title,
            goal: planData.goal,
            sessionsPerWeek: planData.sessionsPerWeek,
        });

        setShowWizard(false);
        setSelectedTemplate(null);
        loadData();

        Alert.alert(
            'Training Plan Created! 🎉',
            `Your ${planData.title} program is ready. Start logging sessions to track your progress!`,
            [{ text: 'Got it!' }]
        );
    };

    const handleWizardCancel = () => {
        setShowWizard(false);
        setSelectedTemplate(null);
    };

    const handleAddSession = async (planId: string, sessionData: Partial<TrainingSessionLog>) => {
        if (!profile) return;

        // Automatically log treats to diet if specified
        // We assume reinforcementType contains the treats used string from the UI
        if (sessionData.reinforcementType) {
            await DietLogRepository.create({
                profileId: profile.id,
                date: Date.now(),
                items: [sessionData.reinforcementType],
                notes: `Treats used during training session: ${sessionData.activity || 'Training'}`
            });
        }

        await TrainingSessionRepository.create({
            ...sessionData,
            profileId: profile.id,
            planId,
            date: Date.now(),
            minutes: typeof sessionData.minutes === 'number' ? sessionData.minutes : parseInt(sessionData.minutes as any) || 0,
            activity: sessionData.activity || 'Training Session',
            notes: sessionData.notes || ''
        });

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
        if (!profile) return;

        await CareTaskRepository.create({
            profileId: profile.id,
            title: task.title,
            schedule: 'Daily',
        });

        Alert.alert('Task Created', `Added "${task.title}" to your tasks.`);
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
        if (!profile || !newTaskTitle.trim()) {
            Alert.alert('Error', 'Please enter a task title');
            return;
        }

        await CareTaskRepository.create({
            profileId: profile.id,
            title: newTaskTitle.trim(),
            schedule: newTaskSchedule
        });

        setNewTaskTitle('');
        setShowAddTask(false);
        loadData();
    };

    const handleLogTask = async (taskId: string, date: string, time: string, notes: string) => {
        if (!profile) return;
        await CareTaskHistoryRepository.create({
            profileId: profile.id,
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

        // Schedule local notification
        const hasPermission = await NotificationService.requestPermissions();
        if (hasPermission) {
            await NotificationService.scheduleDailyReminder(
                taskId,
                `Time for ${task.title}!`,
                `It's ${time}! Don't forget to ${task.title.toLowerCase()}.`,
                time
            );

            // Update task in DB
            await CareTaskRepository.update(taskId, { reminderTime: time });

            Alert.alert('Reminder Set', `Daily reminder set for ${time}`);
            loadData();
        } else {
            Alert.alert('Permission Denied', 'Please enable notifications in settings to use reminders.');
        }
    };

    const handleSaveDiet = async () => {
        if (!profile) return;

        const total = pelletsPercent + veggiesPercent + fruitsPercent + seedsPercent;
        if (total !== 100) {
            Alert.alert('Error', `Percentages must add up to 100% (currently ${total}%)`);
            return;
        }

        await DietPlanRepository.createOrUpdate({
            profileId: profile.id,
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
        if (!profile) return;
        if (!newMealItems.trim()) {
            Alert.alert('Error', 'Please enter at least one food item');
            return;
        }

        await DietLogRepository.create({
            profileId: profile.id,
            date: Date.now(),
            items: newMealItems.split(',').map(s => s.trim()).filter(s => s.length > 0),
            notes: newMealNotes
        });

        setNewMealItems('');
        setNewMealNotes('');
        setShowLogMeal(false);
        loadData();
    };

    const handleDeleteDietLog = async (id: string) => {
        await DietLogRepository.delete(id);
        loadData();
    };

    // Calculate stats
    const tasksCompletedToday = careTasks.filter(t => {
        if (!t.isDone || !t.lastDoneAt) return false;
        const today = new Date().setHours(0, 0, 0, 0);
        return t.lastDoneAt >= today;
    }).length;

    const totalTasksToday = careTasks.filter(t => t.schedule === 'Daily').length;

    const weekStart = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const thisWeekSessions = sessions.filter(s => s.date >= weekStart).length;
    const targetSessions = trainingPlans.reduce((sum, p) => sum + p.sessionsPerWeek, 0);

    if (!profile) {
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

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Tab Navigation */}
            <View style={[styles.tabBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'overview' && { borderBottomColor: theme.colors.brand.primary }]}
                    onPress={() => setActiveTab('overview')}
                >
                    <Text style={[
                        theme.typography.bodySmall,
                        { color: activeTab === 'overview' ? theme.colors.brand.primary : theme.colors.textSecondary }
                    ]}>
                        Overview
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'training' && { borderBottomColor: theme.colors.brand.primary }]}
                    onPress={() => setActiveTab('training')}
                >
                    <Text style={[
                        theme.typography.bodySmall,
                        { color: activeTab === 'training' ? theme.colors.brand.primary : theme.colors.textSecondary }
                    ]}>
                        Training
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'diet' && { borderBottomColor: theme.colors.brand.primary }]}
                    onPress={() => setActiveTab('diet')}
                >
                    <Text style={[
                        theme.typography.bodySmall,
                        { color: activeTab === 'diet' ? theme.colors.brand.primary : theme.colors.textSecondary }
                    ]}>
                        Diet
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'tasks' && { borderBottomColor: theme.colors.brand.primary }]}
                    onPress={() => setActiveTab('tasks')}
                >
                    <Text style={[
                        theme.typography.bodySmall,
                        { color: activeTab === 'tasks' ? theme.colors.brand.primary : theme.colors.textSecondary }
                    ]}>
                        Tasks
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'insights' && { borderBottomColor: theme.colors.brand.primary }]}
                    onPress={() => setActiveTab('insights')}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[
                            theme.typography.bodySmall,
                            { color: activeTab === 'insights' ? theme.colors.brand.primary : theme.colors.textSecondary }
                        ]}>
                            Insights
                        </Text>
                        {unreadRecCount > 0 && (
                            <View style={[styles.tabBadge, { backgroundColor: theme.colors.brand.primary }]}>
                                <Text style={styles.badgeText}>
                                    {unreadRecCount > 9 ? '9+' : unreadRecCount}
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.content}>
                    {/* Overview Tab */}
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
                                    icon="🎯"
                                    value={thisWeekSessions}
                                    label="This Week"
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
                                <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 12 }]}>
                                    Quick Actions
                                </Text>
                                <Button
                                    title="➕ Add Training Plan"
                                    onPress={() => { setActiveTab('training'); setShowTemplateSelection(true); }}
                                    variant="secondary"
                                    style={{ marginBottom: 8 }}
                                />
                                <Button
                                    title="➕ Add Care Task"
                                    onPress={() => { setActiveTab('tasks'); setShowAddTask(true); }}
                                    variant="secondary"
                                />
                            </Card>
                        </>
                    )}

                    {/* Training Tab */}
                    {activeTab === 'training' && (
                        <>
                            {showTemplateSelection ? (
                                <Modal
                                    visible={showTemplateSelection}
                                    animationType="slide"
                                    onRequestClose={() => setShowTemplateSelection(false)}
                                >
                                    <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                                        <View style={styles.modalHeader}>
                                            <Text style={[theme.typography.h2, { color: theme.colors.text }]}>
                                                Choose a Training Program
                                            </Text>
                                            <TouchableOpacity onPress={() => setShowTemplateSelection(false)}>
                                                <Text style={[theme.typography.h2, { color: theme.colors.textSecondary }]}>
                                                    ✕
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                        <ScrollView style={styles.modalContent}>
                                            {TRAINING_TEMPLATES.map((template) => {
                                                const isActive = trainingPlans.some(p => p.templateId === template.id || p.title === template.title);
                                                return (
                                                    <TrainingTemplateCard
                                                        key={template.id}
                                                        template={template}
                                                        onSelect={handleSelectTemplate}
                                                        isAlreadyActive={isActive}
                                                    />
                                                );
                                            })}
                                        </ScrollView>
                                    </View>
                                </Modal>
                            ) : null}

                            {showWizard && selectedTemplate ? (
                                <Modal
                                    visible={showWizard}
                                    animationType="slide"
                                    onRequestClose={handleWizardCancel}
                                >
                                    <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                                        <TrainingWizard
                                            template={selectedTemplate}
                                            onComplete={handleWizardComplete}
                                            onCancel={handleWizardCancel}
                                        />
                                    </View>
                                </Modal>
                            ) : null}

                            <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 16 }]}>
                                Training Plans
                            </Text>

                            {trainingPlans.length === 0 && (
                                <Card style={[styles.emptyCard, { backgroundColor: theme.colors.brand.primary + '10' }]}>
                                    <Text style={[theme.typography.h3, { color: theme.colors.brand.primary, marginBottom: 8, textAlign: 'center' }]}>
                                        🎯 Start Your First Training Program
                                    </Text>
                                    <Text style={[theme.typography.bodySmall, { color: theme.colors.text, textAlign: 'center', marginBottom: 16 }]}>
                                        Choose from our expert-designed training templates with step-by-step guidance, milestones, and daily activities.
                                    </Text>
                                </Card>
                            )}

                            {trainingPlans.map((plan) => (
                                <TrainingPlanCard
                                    key={plan.id}
                                    plan={plan}
                                    sessions={sessions.filter((s: TrainingSessionLog) => s.planId === plan.id)}
                                    onAddSession={handleAddSession}
                                    onUpdatePlan={handleUpdatePlan}
                                    onCreateTask={handleQuickCreateTask}
                                    onDelete={handleDeletePlan}
                                />
                            ))}

                            <Button
                                title="+ Browse Training Templates"
                                onPress={() => setShowTemplateSelection(true)}
                                variant="secondary"
                            />
                        </>
                    )}

                    {/* Diet Tab */}
                    {activeTab === 'diet' && dietPlan && (
                        <>
                            <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 16 }]}>
                                Food Safety & Diet
                            </Text>

                            <FoodLookup onSelect={(item) => {
                                if (item.verdict === 'TOXIC') {
                                    Alert.alert('Warning', `${item.name} is toxic to parrots! Cannot add to meal log.`);
                                    return;
                                }
                                setNewMealItems(prev => prev ? `${prev}, ${item.name}` : item.name);
                                setShowLogMeal(true);
                            }} />

                            <Text style={[theme.typography.h2, { color: theme.colors.text, marginTop: 24, marginBottom: 16 }]}>
                                Daily Nutrition
                            </Text>

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
                                            <Text style={[theme.typography.body, { color: theme.colors.text, flex: 1 }]}>
                                                Pellets
                                            </Text>
                                            <TextInput
                                                style={[styles.percentInput, theme.typography.body, {
                                                    backgroundColor: theme.colors.background,
                                                    color: theme.colors.text,
                                                    borderColor: theme.colors.border,
                                                }]}
                                                value={pelletsPercent.toString()}
                                                onChangeText={(v) => setPelletsPercent(parseInt(v) || 0)}
                                                keyboardType="number-pad"
                                            />
                                            <Text style={[theme.typography.body, { color: theme.colors.text }]}>%</Text>
                                        </View>
                                        <View style={styles.sliderRow}>
                                            <Text style={[theme.typography.body, { color: theme.colors.text, flex: 1 }]}>
                                                Vegetables
                                            </Text>
                                            <TextInput
                                                style={[styles.percentInput, theme.typography.body, {
                                                    backgroundColor: theme.colors.background,
                                                    color: theme.colors.text,
                                                    borderColor: theme.colors.border,
                                                }]}
                                                value={veggiesPercent.toString()}
                                                onChangeText={(v) => setVeggiesPercent(parseInt(v) || 0)}
                                                keyboardType="number-pad"
                                            />
                                            <Text style={[theme.typography.body, { color: theme.colors.text }]}>%</Text>
                                        </View>
                                        <View style={styles.sliderRow}>
                                            <Text style={[theme.typography.body, { color: theme.colors.text, flex: 1 }]}>
                                                Fruits
                                            </Text>
                                            <TextInput
                                                style={[styles.percentInput, theme.typography.body, {
                                                    backgroundColor: theme.colors.background,
                                                    color: theme.colors.text,
                                                    borderColor: theme.colors.border,
                                                }]}
                                                value={fruitsPercent.toString()}
                                                onChangeText={(v) => setFruitsPercent(parseInt(v) || 0)}
                                                keyboardType="number-pad"
                                            />
                                            <Text style={[theme.typography.body, { color: theme.colors.text }]}>%</Text>
                                        </View>
                                        <View style={styles.sliderRow}>
                                            <Text style={[theme.typography.body, { color: theme.colors.text, flex: 1 }]}>
                                                Seeds
                                            </Text>
                                            <TextInput
                                                style={[styles.percentInput, theme.typography.body, {
                                                    backgroundColor: theme.colors.background,
                                                    color: theme.colors.text,
                                                    borderColor: theme.colors.border,
                                                }]}
                                                value={seedsPercent.toString()}
                                                onChangeText={(v) => setSeedsPercent(parseInt(v) || 0)}
                                                keyboardType="number-pad"
                                            />
                                            <Text style={[theme.typography.body, { color: theme.colors.text }]}>%</Text>
                                        </View>

                                        <View style={styles.formButtons}>
                                            <Button title="Save" onPress={handleSaveDiet} style={{ flex: 1, marginRight: 8 }} />
                                            <Button title="Cancel" onPress={() => setEditingDiet(false)} variant="secondary" style={{ flex: 1 }} />
                                        </View>
                                    </View>
                                ) : (
                                    <Button
                                        title="Adjust Targets"
                                        onPress={() => setEditingDiet(true)}
                                        variant="secondary"
                                        style={{ marginTop: 16 }}
                                    />
                                )}
                            </Card>

                            <View style={{ marginTop: 24, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={[theme.typography.h2, { color: theme.colors.text }]}>
                                    Meal Logs
                                </Text>
                                <Button
                                    title="+ Log Meal"
                                    onPress={() => setShowLogMeal(true)}
                                    size="small"
                                />
                            </View>

                            {dietLogs.length === 0 ? (
                                <Card style={{ padding: 24, alignItems: 'center', backgroundColor: theme.colors.surface }}>
                                    <Text style={{ fontSize: 32, marginBottom: 8 }}>🥗</Text>
                                    <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                                        Track what your parrot eats to ensure a balanced diet.
                                    </Text>
                                </Card>
                            ) : (
                                dietLogs.map(log => (
                                    <Card key={log.id} style={{ marginBottom: 12 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: 'bold' }]}>
                                                {new Date(log.date).toLocaleDateString()} {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                            <TouchableOpacity onPress={() => handleDeleteDietLog(log.id)}>
                                                <Text style={{ color: theme.colors.brand.toxic }}>Delete</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                                            {log.items.map((item, idx) => (
                                                <View key={idx} style={{
                                                    backgroundColor: theme.colors.brand.brandPurple + '20',
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 4,
                                                    borderRadius: 12,
                                                    marginRight: 6,
                                                    marginBottom: 6
                                                }}>
                                                    <Text style={[theme.typography.caption, { color: theme.colors.brand.brandPurple }]}>
                                                        {item}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                        {log.notes ? (
                                            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, fontStyle: 'italic' }]}>
                                                "{log.notes}"
                                            </Text>
                                        ) : null}
                                    </Card>
                                ))
                            )}

                            {/* Log Meal Modal */}
                            {showLogMeal && (
                                <Modal
                                    visible={showLogMeal}
                                    animationType="slide"
                                    transparent={true}
                                    onRequestClose={() => setShowLogMeal(false)}
                                >
                                    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 16 }}>
                                        <Card style={{ maxHeight: '80%' }}>
                                            <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 16 }]}>
                                                Log Meal
                                            </Text>

                                            <Text style={[theme.typography.body, { color: theme.colors.text, marginBottom: 8, fontWeight: 'bold' }]}>
                                                What was fed? (comma separated)
                                            </Text>
                                            <TextInput
                                                style={[styles.input, theme.typography.body, {
                                                    backgroundColor: theme.colors.background,
                                                    color: theme.colors.text,
                                                    borderColor: theme.colors.border,
                                                    marginBottom: 16
                                                }]}
                                                placeholder="e.g. Pellets, Apple, Spinach"
                                                placeholderTextColor={theme.colors.textSecondary}
                                                value={newMealItems}
                                                onChangeText={setNewMealItems}
                                            />

                                            <Text style={[theme.typography.body, { color: theme.colors.text, marginBottom: 8, fontWeight: 'bold' }]}>
                                                Notes
                                            </Text>
                                            <TextInput
                                                style={[styles.input, theme.typography.body, {
                                                    backgroundColor: theme.colors.background,
                                                    color: theme.colors.text,
                                                    borderColor: theme.colors.border,
                                                    marginBottom: 24,
                                                    height: 80,
                                                    textAlignVertical: 'top'
                                                }]}
                                                placeholder="Any observations?"
                                                placeholderTextColor={theme.colors.textSecondary}
                                                value={newMealNotes}
                                                onChangeText={setNewMealNotes}
                                                multiline
                                            />

                                            <View style={styles.formButtons}>
                                                <Button title="Save Log" onPress={handleLogMeal} style={{ flex: 1, marginRight: 8 }} />
                                                <Button title="Cancel" onPress={() => setShowLogMeal(false)} variant="secondary" style={{ flex: 1 }} />
                                            </View>
                                        </Card>
                                    </View>
                                </Modal>
                            )}
                        </>
                    )}

                    {/* Tasks Tab */}
                    {activeTab === 'tasks' && (
                        <>
                            <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 16 }]}>
                                Care Tasks & Calendar
                            </Text>

                            <TaskCalendarView
                                tasks={careTasks}
                                history={taskHistory}
                                onLogTask={handleLogTask}
                                onSetReminder={handleSetReminder}
                                onToggleTask={handleToggleTask}
                                theme={theme}
                            />

                            <View style={{ marginTop: 24, marginBottom: 40 }}>
                                {showAddTask ? (
                                    <Card style={styles.formCard}>
                                        <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 12 }]}>
                                            New Care Task
                                        </Text>
                                        <TextInput
                                            style={[styles.input, theme.typography.body, {
                                                backgroundColor: theme.colors.background,
                                                color: theme.colors.text,
                                                borderColor: theme.colors.border,
                                            }]}
                                            value={newTaskTitle}
                                            onChangeText={setNewTaskTitle}
                                            placeholder="Task title (e.g., Trim nails)"
                                            placeholderTextColor={theme.colors.textSecondary}
                                        />

                                        <View style={styles.scheduleButtons}>
                                            {(['Daily', 'Weekly', 'Monthly'] as const).map((schedule) => (
                                                <TouchableOpacity
                                                    key={schedule}
                                                    style={[
                                                        styles.scheduleButton,
                                                        {
                                                            backgroundColor: newTaskSchedule === schedule
                                                                ? theme.colors.brand.primary
                                                                : theme.colors.surface,
                                                            borderColor: theme.colors.border,
                                                        }
                                                    ]}
                                                    onPress={() => setNewTaskSchedule(schedule)}
                                                >
                                                    <Text style={[
                                                        theme.typography.bodySmall,
                                                        {
                                                            color: newTaskSchedule === schedule
                                                                ? '#FFFFFF'
                                                                : theme.colors.text
                                                        }
                                                    ]}>
                                                        {schedule}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        <View style={styles.formButtons}>
                                            <Button title="Add Task" onPress={handleAddTask} style={{ flex: 1, marginRight: 8 }} />
                                            <Button title="Cancel" onPress={() => setShowAddTask(false)} variant="secondary" style={{ flex: 1 }} />
                                        </View>
                                    </Card>
                                ) : (
                                    <Button
                                        title="+ Add Care Task"
                                        onPress={() => setShowAddTask(true)}
                                        variant="secondary"
                                    />
                                )}
                            </View>
                        </>
                    )}

                    {/* Insights Tab */}
                    {activeTab === 'insights' && (
                        <View style={{ padding: 16 }}>
                            {trainingPlans.length > 0 ? (
                                trainingPlans.map(plan => {
                                    const planSessions = sessions.filter(s => s.planId === plan.id);
                                    const template = plan.templateId ?
                                        TRAINING_TEMPLATES.find(t => t.id === plan.templateId) :
                                        TRAINING_TEMPLATES.find(t => t.title === plan.title);

                                    // Calculate current week
                                    const now = Date.now();
                                    const totalSessionsCompleted = planSessions.length;
                                    const sessionsPerMilestone = Math.max(2, Math.floor(plan.sessionsPerWeek / 2));
                                    const weeksCompletedBySession = Math.floor(totalSessionsCompleted / sessionsPerMilestone);
                                    const daysSinceStart = Math.floor((now - plan.createdAt) / (1000 * 60 * 60 * 24));
                                    const weeksElapsed = Math.floor(daysSinceStart / 7);
                                    const currentWeek = Math.max(weeksCompletedBySession + 1, weeksElapsed + 1, 1);

                                    return (
                                        <View key={plan.id} style={{ marginBottom: 16 }}>
                                            <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 16 }]}>
                                                {plan.title} Insights
                                            </Text>
                                            <TrainingInsights
                                                sessions={planSessions}
                                                template={template || null}
                                                currentWeek={currentWeek}
                                            />
                                        </View>
                                    );
                                })
                            ) : (
                                <Card style={{ padding: 40, alignItems: 'center' }}>
                                    <Text style={{ fontSize: 48, marginBottom: 16 }}>🎯</Text>
                                    <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 8 }]}>
                                        No Training Plans Yet
                                    </Text>
                                    <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                                        Start a training plan to see intelligent insights and recommendations.
                                    </Text>
                                </Card>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* AI Chat FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.brand.primary, shadowColor: theme.colors.shadow }]}
                onPress={() => setShowAIChat(true)}
            >
                <Ionicons name="chatbubbles" size={24} color="#FFF" />
            </TouchableOpacity>

            {/* AI Chat Modal */}
            <AIChatModal
                visible={showAIChat}
                onClose={() => setShowAIChat(false)}
                context={{
                    profile,
                    plans: trainingPlans,
                    sessions,
                    diet: dietPlan,
                    tasks: careTasks
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabBadge: {
        marginLeft: 4,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    centerCard: {
        margin: 24,
        padding: 24,
        alignItems: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    quickActionsCard: {
        padding: 16,
        marginTop: 8,
    },
    formCard: {
        padding: 16,
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    formButtons: {
        flexDirection: 'row',
    },
    dietCard: {
        padding: 16,
        marginBottom: 16,
    },
    dietEditForm: {
        marginTop: 16,
        gap: 12,
    },
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    percentInput: {
        width: 60,
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
        textAlign: 'center',
    },
    recommendationCard: {
        padding: 16,
    },
    scheduleButtons: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    scheduleButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(128, 64, 191, 0.1)',
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    emptyCard: {
        padding: 24,
        marginBottom: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        zIndex: 100,
    },
});

export default CareTab;
