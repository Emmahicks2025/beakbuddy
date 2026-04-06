import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface RecommendationsTutorialProps {
    visible: boolean;
    onClose: () => void;
}

export const RecommendationsTutorial: React.FC<RecommendationsTutorialProps> = ({ visible, onClose }) => {
    const { theme } = useTheme();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.popup, { backgroundColor: theme.isDark ? '#1F2937' : '#FFFFFF' }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={{ fontSize: 32, marginBottom: 8 }}>🤖</Text>
                        <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 4 }]}>
                            AI Recommendations
                        </Text>
                        <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                            How it works
                        </Text>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <View style={styles.step}>
                            <Text style={[theme.typography.h3, { color: theme.colors.brand.primary }]}>
                                📊 Analyzes Your Data
                            </Text>
                            <Text style={[theme.typography.body, { color: theme.colors.text, marginTop: 8 }]}>
                                The AI examines your training sessions to find patterns in success rates, timing, behaviors, and consistency.
                            </Text>
                        </View>

                        <View style={styles.step}>
                            <Text style={[theme.typography.h3, { color: theme.colors.brand.primary }]}>
                                💡 Generates Insights
                            </Text>
                            <Text style={[theme.typography.body, { color: theme.colors.text, marginTop: 8 }]}>
                                Based on your real data, you'll get 1-2 unique recommendations with specific numbers and actionable advice.
                            </Text>
                        </View>

                        <View style={styles.step}>
                            <Text style={[theme.typography.h3, { color: theme.colors.brand.primary }]}>
                                ⚡ One-Click Actions
                            </Text>
                            <Text style={[theme.typography.body, { color: theme.colors.text, marginTop: 8 }]}>
                                Each recommendation includes action buttons to implement suggestions instantly (set reminders, adjust schedule, etc.).
                            </Text>
                        </View>

                        <View style={[styles.tip, { backgroundColor: theme.colors.brand.primary + '15', borderColor: theme.colors.brand.primary }]}>
                            <Text style={[theme.typography.bodySmall, { color: theme.colors.text }]}>
                                <Text style={{ fontWeight: '600' }}>💡 Tip:</Text> Complete 3-5 sessions to unlock personalized insights about your optimal training times and behavior patterns!
                            </Text>
                        </View>
                    </View>

                    {/* Close Button */}
                    <TouchableOpacity
                        onPress={onClose}
                        style={[styles.closeButton, { backgroundColor: theme.colors.brand.primary }]}
                    >
                        <Text style={[theme.typography.body, { color: '#FFFFFF', fontWeight: '600' }]}>
                            Got it!
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    popup: {
        borderRadius: 20,
        padding: 24,
        maxWidth: 500,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    content: {
        marginBottom: 24,
    },
    step: {
        marginBottom: 20,
    },
    tip: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 8,
    },
    closeButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
});
