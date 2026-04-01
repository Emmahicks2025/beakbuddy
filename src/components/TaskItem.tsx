import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Card } from './Card';
import { CareTask } from '../types';
// Removed Ionicons for Web compatibility
import { AlertService } from '../services/AlertService';
import { AppDateTimePicker } from './AppDateTimePicker';

interface TaskItemProps {
    task: CareTask;
    onToggle: (taskId: string) => void;
    onDelete?: (taskId: string) => void;
    onSetReminder?: (taskId: string, time: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onSetReminder }) => {
    const { theme } = useTheme();
    const [showTimePicker, setShowTimePicker] = useState(false);

    const getScheduleColor = () => {
        if (task.schedule === 'Daily') return theme.colors.brand.primary;
        if (task.schedule === 'Weekly') return '#FFB74D';
        return '#64B5F6';
    };

    const isOverdue = () => {
        if (!task.lastDoneAt || task.isDone) return false;
        const now = Date.now();
        const daysSince = (now - task.lastDoneAt) / (1000 * 60 * 60 * 24);

        if (task.schedule === 'Daily' && daysSince >= 1) return true;
        if (task.schedule === 'Weekly' && daysSince >= 7) return true;
        if (task.schedule === 'Monthly' && daysSince >= 30) return true;
        return false;
    };

    const handleLongPress = () => {
        if (onDelete) {
            AlertService.confirm(
                'Delete Task',
                `Are you sure you want to delete "${task.title}"?`,
                () => onDelete(task.id),
                'Delete'
            );
        }
    };

    const overdue = isOverdue();

    return (
        <View>
            <TouchableOpacity
                onPress={() => onToggle(task.id)}
                onLongPress={handleLongPress}
                activeOpacity={0.7}
            >
                <Card style={[
                    styles.container,
                    !!task.isDone && styles.completedContainer,
                    overdue && styles.overdueContainer
                ]}>
                    <View style={styles.content}>
                        <View style={[
                            styles.checkbox,
                            {
                                borderColor: task.isDone ? theme.colors.brand.safe : theme.colors.border,
                                backgroundColor: task.isDone ? theme.colors.brand.safe : 'transparent',
                            }
                        ]}>
                            {task.isDone && <Text style={{ fontSize: 14 }}>✔️</Text>}
                        </View>

                        <View style={styles.textContainer}>
                            <Text style={[
                                theme.typography.body,
                                {
                                    color: theme.colors.text,
                                    textDecorationLine: task.isDone ? 'line-through' : 'none',
                                    fontWeight: '600',
                                    opacity: task.isDone ? 0.6 : 1
                                }
                            ]}>
                                {task.title}
                            </Text>

                            <View style={styles.metaRow}>
                                <View style={[styles.scheduleBadge, { backgroundColor: getScheduleColor() + '20' }]}>
                                    <Text style={[
                                        theme.typography.caption,
                                        { color: getScheduleColor(), fontWeight: '700' }
                                    ]}>
                                        {task.schedule.toUpperCase()}
                                    </Text>
                                </View>

                                {task.reminderTime && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 10, marginRight: 2 }}>🔔</Text>
                                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                                            {task.reminderTime}
                                        </Text>
                                    </View>
                                )}

                                {task.streak && task.streak > 1 ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 12 }}>🔥</Text>
                                        <Text style={[theme.typography.caption, { color: theme.colors.brand.primary, fontWeight: 'bold' }]}>
                                            {task.streak}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>

                        {/* Reminder Button */}
                        {!task.isDone && onSetReminder && (
                            <TouchableOpacity
                                onPress={() => setShowTimePicker(true)}
                                style={{ padding: 8 }}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Text style={{ fontSize: 18, color: task.reminderTime ? theme.colors.brand.primary : theme.colors.textSecondary }}>
                                    {task.reminderTime ? "🔔" : "🔕"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Card>
            </TouchableOpacity>

            <AppDateTimePicker
                visible={showTimePicker}
                mode="time"
                onClose={() => setShowTimePicker(false)}
                value={(() => {
                    const now = new Date();
                    if (task.reminderTime) {
                        const [h, m] = task.reminderTime.split(':');
                        now.setHours(Number(h), Number(m));
                    }
                    return now;
                })()}
                onChange={(event, date) => {
                    if (date) {
                        const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                        if (onSetReminder) onSetReminder(task.id, timeStr);
                    }
                    if (Platform.OS !== 'ios') {
                        setShowTimePicker(false);
                    }
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
        padding: 16,
    },
    completedContainer: {
        opacity: 0.7,
    },
    overdueContainer: {
        borderLeftWidth: 4,
        borderLeftColor: '#FF1744',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 12,
    },
    scheduleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
});
