
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const DateTimePicker = Platform.OS === 'web' ? null : require('@react-native-community/datetimepicker').default;

interface AppDateTimePickerProps {
    value: Date;
    mode: 'date' | 'time';
    onChange: (event: any, date?: Date) => void;
    onClose: () => void;
    visible: boolean;
}

export const AppDateTimePicker: React.FC<AppDateTimePickerProps> = ({
    value,
    mode,
    onChange,
    onClose,
    visible
}) => {
    const { theme } = useTheme();

    if (!visible) return null;

    if (Platform.OS !== 'web') {
        return (
            <DateTimePicker
                value={value}
                mode={mode}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                is24Hour={true}
                onChange={(event: any, date?: Date) => {
                    onChange(event, date);
                    if (Platform.OS === 'android') {
                        onClose();
                    }
                }}
            />
        );
    }

    // Web Implementation: A small centered modal with a custom picker UI
    // Note: In a real "premium" app, we might use a calendar library or custom wheels.
    // For now, we'll use a neat grid/list approach that stays within view.

    const handleWebSelect = (newDate: Date) => {
        onChange({ type: 'set' }, newDate);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.webOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={[styles.webContainer, { backgroundColor: theme.isDark ? '#1F2937' : '#FFFFFF', borderColor: theme.colors.border }]}>
                    <View style={styles.webHeader}>
                        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                            Select {mode === 'date' ? 'Date' : 'Time'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={[theme.typography.body, { color: theme.colors.brand.primary }]}>Done</Text>
                        </TouchableOpacity>
                    </View>

                    {mode === 'date' ? (
                        <WebDatePicker value={value} onSelect={handleWebSelect} theme={theme} />
                    ) : (
                        <WebTimePicker value={value} onSelect={handleWebSelect} theme={theme} />
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const WebDatePicker: React.FC<{ value: Date; onSelect: (date: Date) => void; theme: any }> = ({ value, onSelect, theme }) => {
    // Simple year/month/day selectors for web to avoid standard full-screen native browser picker
    const [selectedDate, setSelectedDate] = useState(new Date(value));

    const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();

    const updateDate = (day: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(day);
        setSelectedDate(newDate);
        onSelect(newDate);
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setSelectedDate(newDate);
    };

    const days = [];
    const totalDays = daysInMonth(selectedDate.getMonth(), selectedDate.getFullYear());
    // Get start day of month (0-6)
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();

    // Add spacer cells
    for (let s = 0; s < firstDayOfMonth; s++) {
        days.push(-s);
    }
    for (let i = 1; i <= totalDays; i++) {
        days.push(i);
    }

    const monthName = selectedDate.toLocaleString('default', { month: 'long' });
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <View style={styles.pickerContent}>
            <View style={styles.monthNavigator}>
                <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navTouch}>
                    <Text style={[styles.navBtn, { color: theme.colors.brand.primary }]}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={[theme.typography.body, { color: theme.colors.text, fontWeight: '700' }]}>
                    {monthName} {selectedDate.getFullYear()}
                </Text>
                <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navTouch}>
                    <Text style={[styles.navBtn, { color: theme.colors.brand.primary }]}>{'>'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.daysGrid}>
                {dayLabels.map(l => (
                    <View key={l} style={styles.dayCell}>
                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, fontWeight: '700' }]}>{l}</Text>
                    </View>
                ))}
                {days.map((day, idx) => (
                    day <= 0 ? (
                        <View key={`empty - ${idx} `} style={styles.dayCell} />
                    ) : (
                        <TouchableOpacity
                            key={day}
                            style={[
                                styles.dayCell,
                                selectedDate.getDate() === day && { backgroundColor: theme.colors.brand.primary }
                            ]}
                            onPress={() => updateDate(day)}
                        >
                            <Text style={[
                                theme.typography.bodySmall,
                                { color: selectedDate.getDate() === day ? '#FFF' : theme.colors.text }
                            ]}>
                                {day}
                            </Text>
                        </TouchableOpacity>
                    )
                ))}
            </View>
        </View>
    );
};

const WebTimePicker: React.FC<{ value: Date; onSelect: (date: Date) => void; theme: any }> = ({ value, onSelect, theme }) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 5 min increments for web UX simplicity

    const [selectedHours, setSelectedHours] = useState(value.getHours());
    const [selectedMinutes, setSelectedMinutes] = useState(value.getMinutes());

    const handleSelect = (h: number, m: number) => {
        const newDate = new Date(value);
        newDate.setHours(h);
        newDate.setMinutes(m);
        onSelect(newDate);
    };

    return (
        <View style={styles.pickerContent}>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 8, fontWeight: '700' }]}>HOUR</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
                {hours.map(h => (
                    <TouchableOpacity
                        key={h}
                        style={[styles.timeCell, selectedHours === h && { backgroundColor: theme.colors.brand.primary }]}
                        onPress={() => { setSelectedHours(h); handleSelect(h, selectedMinutes); }}
                    >
                        <Text style={[theme.typography.body, { color: selectedHours === h ? '#FFF' : theme.colors.text }]}>
                            {h.toString().padStart(2, '0')}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginVertical: 8, fontWeight: '700' }]}>MINUTE (5m steps)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
                {minutes.map(m => (
                    <TouchableOpacity
                        key={m}
                        style={[styles.timeCell, selectedMinutes === m && { backgroundColor: theme.colors.brand.primary }]}
                        onPress={() => { setSelectedMinutes(m); handleSelect(selectedHours, m); }}
                    >
                        <Text style={[theme.typography.body, { color: selectedMinutes === m ? '#FFF' : theme.colors.text }]}>
                            {m.toString().padStart(2, '0')}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    webOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    webContainer: {
        width: 350,
        borderRadius: 24,
        borderWidth: 1,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
    },
    webHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    pickerContent: {
        minHeight: 250,
    },
    monthNavigator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    navTouch: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    navBtn: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: 43,
        height: 43,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    scrollRow: {
        flexDirection: 'row',
        maxHeight: 50,
        marginBottom: 10,
    },
    timeCell: {
        width: 50,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
    }
});
