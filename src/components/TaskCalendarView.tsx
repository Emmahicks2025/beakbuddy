import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { AppDateTimePicker } from './AppDateTimePicker';
import { CareTask, CareTaskHistory } from '../types';
// Removed Ionicons for Web compatibility
import { Card } from './Card';
import { StatBadge } from './StatBadge';
import { TaskItem } from './TaskItem';

interface TaskCalendarViewProps {
    tasks: CareTask[];
    history: CareTaskHistory[];
    onLogTask: (taskId: string, date: string, time: string, notes: string) => Promise<void>;
    onSetReminder: (taskId: string, time: string) => void;
    onToggleTask: (taskId: string) => void;
    onAddTask: (task: { title: string, schedule: string, dueDate: number }) => Promise<void>;
    theme: any;
}

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({ tasks, history, onLogTask, onSetReminder, onToggleTask, onAddTask, theme }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [modalVisible, setModalVisible] = useState(false);
    const [activeTask, setActiveTask] = useState<CareTask | null>(null);
    const [notes, setNotes] = useState('');
    const [time, setTime] = useState('');
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskFrequency, setNewTaskFrequency] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

    // Compute marked dates (productivity logic)
    const markedDates = useMemo(() => {
        const marks: any = {};
        const dailyTaskCount = tasks.filter(t => t.schedule === 'Daily').length;

        // Group history by date
        const historyByDate: Record<string, number> = {};
        history.forEach(h => {
            historyByDate[h.date] = (historyByDate[h.date] || 0) + 1;
        });

        // Color logic
        Object.keys(historyByDate).forEach(date => {
            const count = historyByDate[date];
            let color = theme.colors.brand.secondary; // Partial
            if (dailyTaskCount > 0 && count >= dailyTaskCount) {
                color = theme.colors.brand.safe; // Perfect day
            }

            marks[date] = {
                selected: true,
                selectedColor: color,
                selectedTextColor: '#ffffff'
            };
        });

        // Current selected override
        marks[selectedDate] = {
            ...marks[selectedDate],
            selected: true,
            selectedColor: theme.colors.brand.primary, // Highlight selected
            selectedTextColor: '#ffffff'
        };
        return marks;
    }, [history, selectedDate, theme, tasks]);

    // Calculate current streak (consecutive days with at least 1 task)
    const currentStreak = useMemo(() => {
        let streak = 0;
        const today = new Date();
        // Check backwards from yesterday
        for (let i = 0; i < 365; i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            const hasLog = history.some(h => h.date === dateStr);
            if (hasLog) streak++;
            else if (i === 0) continue; // Allow today to not be done yet without breaking streak
            else break;
        }
        return streak;
    }, [history]);

    const openLogModal = (task: CareTask) => {
        const existingLog = history.find(h => h.taskId === task.id && h.date === selectedDate);
        const now = new Date();
        const defaultTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        setActiveTask(task);
        setNotes(existingLog?.notes || '');
        setTime(existingLog?.time || defaultTime);
        setModalVisible(true);
    };

    const handleSaveLog = async () => {
        if (activeTask) {
            await onLogTask(activeTask.id, selectedDate, time, notes);
            setModalVisible(false);
            setActiveTask(null);
        }
    };

    const dayHistory = history.filter(h => h.date === selectedDate);
    const dayProgress = Math.round((dayHistory.length / (tasks.length || 1)) * 100);

    return (
        <View style={styles.container}>
            {/* Stats Header */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16, paddingHorizontal: 16 }}>
                <StatBadge
                    icon="🔥"
                    value={currentStreak}
                    label="Day Streak"
                    color={currentStreak > 2 ? theme.colors.brand.primary : theme.colors.textSecondary}
                    style={{ flex: 1 }}
                />
                <StatBadge
                    icon="📊"
                    value={`${dayProgress}%`}
                    label="Today's Goal"
                    color={dayProgress === 100 ? theme.colors.brand.safe : theme.colors.brand.secondary}
                    style={{ flex: 1 }}
                />
            </View>

            {/* Productivity Calendar Grid */}
            <Card style={{ marginHorizontal: 16, marginBottom: 16, padding: 16 }}>
                {/* Month Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <TouchableOpacity onPress={() => {
                        const d = new Date(selectedDate);
                        d.setMonth(d.getMonth() - 1);
                        setSelectedDate(d.toISOString().split('T')[0]);
                    }}>
                        <Text style={{ fontSize: 20 }}>←</Text>
                    </TouchableOpacity>
                    <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                        {new Date(selectedDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Text>
                    <TouchableOpacity onPress={() => {
                        const d = new Date(selectedDate);
                        d.setMonth(d.getMonth() + 1);
                        setSelectedDate(d.toISOString().split('T')[0]);
                    }}>
                        <Text style={{ fontSize: 20 }}>→</Text>
                    </TouchableOpacity>
                </View>

                {/* Days Grid */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <Text key={day} style={{ width: '14.28%', textAlign: 'center', fontSize: 12, color: theme.colors.textSecondary, marginBottom: 8, fontWeight: '600' }}>
                            {day[0]}
                        </Text>
                    ))}

                    {(() => {
                        const curr = new Date(selectedDate);
                        const firstDay = new Date(curr.getFullYear(), curr.getMonth(), 1).getDay();
                        const daysInMonth = new Date(curr.getFullYear(), curr.getMonth() + 1, 0).getDate();
                        const cells = [];

                        // Empty start cells
                        for (let i = 0; i < firstDay; i++) {
                            cells.push(<View key={`empty-${i}`} style={{ width: '14.28%', aspectRatio: 1 }} />);
                        }

                        // Day cells
                        for (let i = 1; i <= daysInMonth; i++) {
                            const dateStr = new Date(curr.getFullYear(), curr.getMonth(), i).toISOString().split('T')[0];
                            const isSelected = dateStr === selectedDate;

                            // Check for tasks on this day
                            const hasTasks = tasks.some(t => history.some(h => h.date === dateStr));

                            cells.push(
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => setSelectedDate(dateStr)}
                                    style={{
                                        width: '14.28%',
                                        aspectRatio: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 4
                                    }}
                                >
                                    <View style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 16,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backgroundColor: isSelected ? theme.colors.brand.primary : 'transparent',
                                        borderWidth: dateStr === new Date().toISOString().split('T')[0] && !isSelected ? 1 : 0,
                                        borderColor: theme.colors.brand.primary
                                    }}>
                                        <Text style={{
                                            color: isSelected ? '#FFF' : theme.colors.text,
                                            fontWeight: isSelected ? 'bold' : 'normal'
                                        }}>
                                            {i}
                                        </Text>
                                    </View>
                                    {/* Task Dot */}
                                    {(hasTasks || isSelected) && (
                                        <View style={{
                                            width: 4,
                                            height: 4,
                                            borderRadius: 2,
                                            backgroundColor: isSelected ? '#FFF' : theme.colors.brand.accent,
                                            marginTop: 2
                                        }} />
                                    )}
                                </TouchableOpacity>
                            );
                        }
                        return cells;
                    })()}
                </View>
            </Card>

            {/* Selected Day Header */}
            <View style={[styles.dayHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                    {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>
                <TouchableOpacity
                    onPress={() => setShowAddTask(true)}
                    style={{
                        backgroundColor: theme.colors.brand.primary + '20',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16
                    }}
                >
                    <Text style={{ color: theme.colors.brand.primary, fontWeight: '600', fontSize: 13 }}>+ Add Task</Text>
                </TouchableOpacity>
            </View>

            {/* Tasks List for Day */}
            <View style={styles.taskList}>
                {tasks.map(task => {
                    const log = dayHistory.find(h => h.taskId === task.id);
                    const isToday = selectedDate === new Date().toISOString().split('T')[0];
                    const effectiveTask = { ...task, isDone: !!log ? 1 : (isToday ? task.isDone : 0) };

                    return (
                        <TaskItem
                            key={task.id}
                            task={effectiveTask}
                            onToggle={(id) => {
                                if (isToday) onToggleTask(id);
                                else openLogModal(task); // Edit log if different day
                            }}
                            onSetReminder={onSetReminder}
                        />
                    );
                })}
                {tasks.length === 0 && (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: theme.colors.textSecondary }}>No tasks for this day</Text>
                    </View>
                )}
                <View style={{ height: 40 }} />
            </View>

            {/* Log Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
                        <View style={styles.modalOverlay}>
                            <View style={[styles.modalContent, {
                                backgroundColor: theme.isDark ? '#1F2937' : '#FFFFFF',
                        opacity: 1
                    }]}>
                        <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 16 }]}>
                            {activeTask?.title}
                        </Text>

                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 8 }]}>Time Completed</Text>
                        <TouchableOpacity
                            onPress={() => setShowTimePicker(true)}
                            style={[styles.inputContainer, { borderColor: theme.colors.border, marginBottom: 16, padding: 12, minHeight: 48, justifyContent: 'center' }]}
                        >
                            <Text style={[theme.typography.body, { color: theme.colors.text }]}>
                                {time || 'Select Time'}
                            </Text>
                        </TouchableOpacity>

                        <AppDateTimePicker
                            value={(() => {
                                const [h, m] = (time || '12:00').split(':');
                                const d = new Date();
                                d.setHours(parseInt(h), parseInt(m));
                                return d;
                            })()}
                            mode="time"
                            visible={showTimePicker}
                            onClose={() => setShowTimePicker(false)}
                            onChange={(event, date) => {
                                if (date) {
                                    const h = date.getHours().toString().padStart(2, '0');
                                    const m = date.getMinutes().toString().padStart(2, '0');
                                    setTime(`${h}:${m}`);
                                }
                                if (Platform.OS !== 'ios') {
                                    setShowTimePicker(false);
                                }
                            }}
                        />

                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 8 }]}>Notes (Optional)</Text>
                        <TextInput
                            style={[styles.inputContainer, theme.typography.body, {
                                borderColor: theme.colors.border,
                                marginBottom: 24,
                                color: theme.colors.text,
                                padding: 12,
                                height: 80,
                                textAlignVertical: 'top'
                            }]}
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Details about the task..."
                            placeholderTextColor={theme.colors.textSecondary}
                            multiline
                        />

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: theme.colors.background, flex: 1 }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={[theme.typography.body, { color: theme.colors.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: theme.colors.brand.primary, flex: 1 }]}
                                onPress={handleSaveLog}
                            >
                                <Text style={[theme.typography.body, { color: '#fff', fontWeight: 'bold' }]}>
                                    Complete Task
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>

            {/* Add Task Modal */}
            <Modal
                visible={showAddTask}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAddTask(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
                        <View style={styles.modalOverlay}>
                            <View style={[styles.modalContent, {
                                backgroundColor: theme.isDark ? '#1F2937' : '#FFFFFF',
                        opacity: 1
                    }]}>
                        <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 16 }]}>
                            New Task
                        </Text>

                        <TextInput
                            style={[
                                styles.inputContainer,
                                theme.typography.body,
                                {
                                    marginBottom: 20,
                                    padding: 12,
                                    color: theme.colors.text,
                                    borderColor: theme.colors.border
                                }
                            ]}
                            placeholder="What needs to be done?"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={newTaskTitle}
                            onChangeText={setNewTaskTitle}
                        />

                        {/* Frequency Selector */}
                        <View style={{ marginBottom: 24 }}>
                            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 8 }]}>
                                Frequency
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                {['Daily', 'Weekly', 'Monthly'].map((freq) => (
                                    <TouchableOpacity
                                        key={freq}
                                        onPress={() => setNewTaskFrequency(freq as any)}
                                        style={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 16,
                                            borderRadius: 20,
                                            backgroundColor: newTaskFrequency === freq ? theme.colors.brand.primary : theme.colors.surface,
                                            borderWidth: 1,
                                            borderColor: newTaskFrequency === freq ? theme.colors.brand.primary : theme.colors.border,
                                        }}
                                    >
                                        <Text style={{
                                            color: newTaskFrequency === freq ? '#FFF' : theme.colors.text,
                                            fontSize: 13,
                                            fontWeight: '500'
                                        }}>
                                            {freq}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => setShowAddTask(false)}
                                style={[styles.button, { backgroundColor: theme.colors.background, flex: 1 }]}
                            >
                                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={async () => {
                                    if (!newTaskTitle.trim()) {
                                        return;
                                    }
                                    try {
                                        await onAddTask({
                                            title: newTaskTitle,
                                            schedule: newTaskFrequency,
                                            dueDate: new Date(selectedDate).getTime(),
                                        });
                                        setShowAddTask(false);
                                        setNewTaskTitle('');
                                        setNewTaskFrequency('Daily');
                                    } catch (e) {
                                        console.error('Add task failed:', e);
                                    }
                                }}
                                style={[styles.button, { backgroundColor: theme.colors.brand.primary, flex: 1 }]}
                            >
                                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Add Task</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    dayHeader: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    taskList: {
        padding: 16,
    },
    taskItem: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        borderRadius: 24,
        padding: 24,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    inputContainer: {
        borderWidth: 1,
        borderRadius: 12,
    },
    button: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    }
});
