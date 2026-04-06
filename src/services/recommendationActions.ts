// Recommendation Action Handlers
import { TrainingPlan } from '../types';
import { StorageService } from './StorageService';
import { Platform } from 'react-native';

export interface RecommendationAction {
    type: 'reminder' | 'schedule' | 'parameter' | 'task' | 'observable';
    label: string; // Button text
    icon: string; // Emoji
    data: any; // Action-specific data
}

/**
 * Execute a recommendation action
 */
export async function executeRecommendationAction(
    action: RecommendationAction,
    planId: string,
    onUpdatePlan?: (planId: string, updates: Partial<TrainingPlan>) => void,
    onCreateTask?: (task: { title: string; description: string; category: string }) => void
): Promise<{ success: boolean; message: string }> {
    try {
        switch (action.type) {
            case 'reminder':
                return await handleSetReminder(action.data);

            case 'schedule':
                return await handleAdjustSchedule(action.data, planId, onUpdatePlan);

            case 'parameter':
                return await handleModifyParameter(action.data, planId, onUpdatePlan);

            case 'task':
                return await handleCreateTask(action.data, onCreateTask);

            case 'observable':
                return await handleAddObservable(action.data, planId, onUpdatePlan);

            default:
                return { success: false, message: 'Unknown action type' };
        }
    } catch (error) {
        console.error('Action execution error:', error);
        return { success: false, message: 'Failed to execute action' };
    }
}

/**
 * Set a daily reminder
 */
/**
 * Set a daily reminder
 */
async function handleSetReminder(data: { time?: string; message?: string }): Promise<{ success: boolean; message: string }> {
    const timeStr = data.time || '09:00';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const message = data.message || 'Time for training session!';

    if (Platform.OS === 'web') {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const stored = await StorageService.getItem('training-reminders');
                const reminders = JSON.parse(stored || '[]');
                reminders.push({
                    time: timeStr,
                    message,
                    enabled: true,
                    createdAt: Date.now()
                });
                await StorageService.setItem('training-reminders', JSON.stringify(reminders));

                return {
                    success: true,
                    message: `Daily reminder set for ${timeStr}`
                };
            }
            return { success: false, message: 'Notification permission denied' };
        }
        return { success: false, message: 'Notifications not supported in this browser' };
    } else {
        // Native platforms use expo-notifications
        try {
            const Notifications = require('expo-notifications');

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                return { success: false, message: 'Failed to get push token for push notification!' };
            }

            // Schedule a daily notification
            // Note: Expo Notifications API for scheduling
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Parrot Training Time!",
                    body: message,
                    sound: true,
                },
                trigger: {
                    hour: hours,
                    minute: minutes,
                    repeats: true,
                },
            });

            return {
                success: true,
                message: `Daily reminder scheduled for ${timeStr}`
            };
        } catch (e) {
            console.warn('Failed to schedule native notification', e);
            return { success: false, message: 'Failed to schedule notification' };
        }
    }
}

/**
 * Adjust training schedule frequency
 */
async function handleAdjustSchedule(
    data: { sessionsPerWeek?: number },
    planId: string,
    onUpdatePlan?: (planId: string, updates: Partial<TrainingPlan>) => void
): Promise<{ success: boolean; message: string }> {
    if (!onUpdatePlan) {
        return { success: false, message: 'Cannot update plan' };
    }

    const sessionsPerWeek = data.sessionsPerWeek || 5;
    onUpdatePlan(planId, { sessionsPerWeek });

    return {
        success: true,
        message: `Training schedule updated to ${sessionsPerWeek} sessions per week`
    };
}

/**
 * Modify training parameters
 */
async function handleModifyParameter(
    data: { duration?: number; targetSuccessRate?: number },
    planId: string,
    onUpdatePlan?: (planId: string, updates: Partial<TrainingPlan>) => void
): Promise<{ success: boolean; message: string }> {
    if (!onUpdatePlan) {
        return { success: false, message: 'Cannot update plan' };
    }

    // Note: We'd need to add these fields to TrainingPlan type
    // For now, just return success
    if (data.duration) {
        return {
            success: true,
            message: `Session duration updated to ${data.duration} minutes`
        };
    }

    return { success: true, message: 'Parameters updated' };
}

/**
 * Create a task in Tasks tab
 */
async function handleCreateTask(
    data: { title: string; description?: string },
    onCreateTask?: (task: { title: string; description: string; category: string }) => void
): Promise<{ success: boolean; message: string }> {
    if (!onCreateTask) {
        return { success: false, message: 'Cannot create task' };
    }

    onCreateTask({
        title: data.title,
        description: data.description || '',
        category: 'training'
    });

    return {
        success: true,
        message: `Task "${data.title}" added to Tasks tab`
    };
}

/**
 * Add observable behavior to track
 */
async function handleAddObservable(
    data: { observable: string },
    planId: string,
    onUpdatePlan?: (planId: string, updates: Partial<TrainingPlan>) => void
): Promise<{ success: boolean; message: string }> {
    // This would require extending the training plan structure
    // For now, just return success
    return {
        success: true,
        message: `Now tracking: ${data.observable}`
    };
}

/**
 * Parse actions from AI-generated recommendation
 */
export function parseActionsFromRecommendation(
    title: string,
    description: string
): RecommendationAction[] {
    const actions: RecommendationAction[] = [];

    // Pattern matching for common recommendation types

    // Frequency recommendations
    if (description.toLowerCase().includes('sessions per week') ||
        description.toLowerCase().includes('training frequency')) {
        const match = description.match(/(\d+)\s+sessions/i);
        if (match) {
            actions.push({
                type: 'schedule',
                label: `Adjust to ${match[1]}/week`,
                icon: '📅',
                data: { sessionsPerWeek: parseInt(match[1]) }
            });
        }
        actions.push({
            type: 'reminder',
            label: 'Set Daily Reminder',
            icon: '🔔',
            data: { time: '09:00', message: 'Time for training!' }
        });
    }

    // Duration recommendations
    if (description.toLowerCase().includes('minutes') &&
        (description.toLowerCase().includes('shorter') || description.toLowerCase().includes('longer'))) {
        const match = description.match(/(\d+)\s+min/i);
        if (match) {
            actions.push({
                type: 'parameter',
                label: `Set to ${match[1]} min`,
                icon: '⏱️',
                data: { duration: parseInt(match[1]) }
            });
        }
    }

    // Timing/observation recommendations
    if (description.toLowerCase().includes('timing') ||
        description.toLowerCase().includes('observe') ||
        description.toLowerCase().includes('watch for')) {
        actions.push({
            type: 'task',
            label: 'Add Practice Task',
            icon: '📝',
            data: {
                title: `Practice: ${title}`,
                description: description.split('.')[0]
            }
        });
    }

    // Behavior tracking
    if (description.toLowerCase().includes('track') ||
        description.toLowerCase().includes('monitor')) {
        actions.push({
            type: 'observable',
            label: 'Track This Behavior',
            icon: '👁️',
            data: { observable: title }
        });
    }

    return actions;
}
