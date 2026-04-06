import { Platform } from 'react-native';

let Notifications: any = null;
if (Platform.OS !== 'web') {
    Notifications = require('expo-notifications');
}

// Configure notification behavior
// Configure notification behavior
if (Platform.OS !== 'web') {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
}

export const NotificationService = {
    requestPermissions: async () => {
        if (Platform.OS === 'web') {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                return permission === 'granted';
            }
            return false;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        return finalStatus === 'granted';
    },

    scheduleDailyReminder: async (id: string, title: string, body: string, time: string) => {
        // time format "HH:mm"
        const [hours, minutes] = time.split(':').map(Number);

        if (Platform.OS === 'web') {
            console.log(`[Web Notification Request] ${title}: ${body} at ${time}`);
            // Web doesn't support complex scheduling easily without service workers,
            // but we can request permission to show readiness.
            if ('Notification' in window && Notification.permission === 'granted') {
                // Determine time until next alert
                const now = new Date();
                const scheduled = new Date();
                scheduled.setHours(hours, minutes, 0, 0);
                if (scheduled <= now) {
                    scheduled.setDate(scheduled.getDate() + 1);
                }
                const delay = scheduled.getTime() - now.getTime();

                // For demo purposes on web, we might just log or set a simple timeout if the app stays open
                // Real web push requires a backend server.
                setTimeout(() => {
                    new Notification(title, { body });
                }, delay);
            }
            return id; // Return ID as identifier
        }

        // Cancel existing notification for this task if any
        await Notifications.cancelScheduledNotificationAsync(id);

        // Schedule new
        const trigger: any = {
            type: 'calendar',
            hour: hours,
            minute: minutes,
            repeats: true,
        };

        const identifier = await Notifications.scheduleNotificationAsync({
            identifier: id,
            content: {
                title,
                body,
                sound: true,
            },
            trigger,
        });

        return identifier;
    },

    cancelReminder: async (id: string) => {
        if (Platform.OS === 'web') return; // No-op for now on web logic
        await Notifications.cancelScheduledNotificationAsync(id);
    },

    sendImmediateNotification: async (title: string, body: string) => {
        if (Platform.OS === 'web') {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, { body });
            } else {
                alert(`${title}\n${body}`);
            }
            return;
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
            },
            trigger: null, // Immediate
        });
    }
};
