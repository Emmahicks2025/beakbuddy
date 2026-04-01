import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { AlertService } from '../../services/AlertService';

const SupportTicketScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { theme } = useTheme();
    const [category, setCategory] = useState('Question');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [includeLogs, setIncludeLogs] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = ['Question', 'Bug Report', 'Feature Request', 'Billing'];

    const handleSubmit = () => {
        if (!subject || !message) {
            AlertService.alert('Error', 'Please fill in both subject and message.');
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            const ticketId = Math.floor(100000 + Math.random() * 900000);
            AlertService.alert(
                'Ticket Submitted',
                `Thank you! Your support ticket (#PM-${ticketId}) has been created. Our team will get back to you within 24-48 hours.`,
                [{ text: 'Great!', onPress: () => navigation.goBack() }]
            );
        }, 1500);
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 8, fontWeight: '700' }]}>
                    Contact our team
                </Text>
                <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: 24 }]}>
                    We usually respond within one business day.
                </Text>

                <Card style={styles.formCard}>
                    <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 12 }]}>
                        Category
                    </Text>
                    <View style={styles.categoryGrid}>
                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.categoryButton,
                                    {
                                        backgroundColor: category === cat ? theme.colors.brand.primary + '15' : 'transparent',
                                        borderColor: category === cat ? theme.colors.brand.primary : theme.colors.border
                                    }
                                ]}
                                onPress={() => setCategory(cat)}
                            >
                                <Text style={[
                                    theme.typography.caption,
                                    { color: category === cat ? theme.colors.brand.primary : theme.colors.textSecondary, fontWeight: '600' }
                                ]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 24, marginBottom: 12 }]}>
                        Subject
                    </Text>
                    <TextInput
                        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                        placeholder="What's happening?"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={subject}
                        onChangeText={setSubject}
                    />

                    <Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 24, marginBottom: 12 }]}>
                        Message
                    </Text>
                    <TextInput
                        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, height: 120, textAlignVertical: 'top' }]}
                        placeholder="Tell us more details..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                    />

                    <View style={styles.switchRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Include Debug Logs</Text>
                            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>Help us fix technical issues faster.</Text>
                        </View>
                        <Switch
                            value={includeLogs}
                            onValueChange={setIncludeLogs}
                            trackColor={{ false: theme.colors.border, true: theme.colors.brand.primary + '80' }}
                            thumbColor={includeLogs ? theme.colors.brand.primary : '#f4f3f4'}
                        />
                    </View>
                </Card>

                <Button
                    title={isSubmitting ? "⌛ Submitting..." : "Send Ticket"}
                    onPress={handleSubmit}
                    style={styles.submitButton}
                    disabled={isSubmitting}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    formCard: {
        padding: 20,
        borderRadius: 20,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryButton: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
    },
    submitButton: {
        marginTop: 32,
        marginBottom: 32,
    }
});

export default SupportTicketScreen;
