import { Alert, Platform } from 'react-native';

export const AlertService = {
    alert: (title: string, message?: string, buttons?: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[]) => {
        if (Platform.OS === 'web') {
            const result = window.confirm(`${title}${message ? '\n\n' + message : ''}`);
            if (result) {
                const okButton = buttons?.find(b => b.style !== 'cancel' && b.text.toLowerCase() !== 'cancel');
                if (okButton && okButton.onPress) {
                    okButton.onPress();
                } else if (!buttons || buttons.length === 0 || (buttons.length === 1 && buttons[0].text.toLowerCase() === 'ok')) {
                    // Standard alert case, nothing to do
                }
            } else {
                const cancelButton = buttons?.find(b => b.style === 'cancel' || b.text.toLowerCase() === 'cancel');
                if (cancelButton && cancelButton.onPress) {
                    cancelButton.onPress();
                }
            }
        } else {
            Alert.alert(title, message, buttons as any);
        }
    },

    confirm: (title: string, message: string, onConfirm: () => void, confirmText: string = 'Confirm') => {
        if (Platform.OS === 'web') {
            if (window.confirm(`${title}\n\n${message}`)) {
                onConfirm();
            }
        } else {
            Alert.alert(
                title,
                message,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: confirmText, style: 'destructive', onPress: onConfirm }
                ]
            );
        }
    }
};
