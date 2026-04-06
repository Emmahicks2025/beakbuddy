import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface TourStep {
    title: string;
    description: string;
    icon: string;
    targetTab: string;
}

const TOUR_STEPS: TourStep[] = [
    {
        title: 'Welcome to BeakBuddy!',
        description: 'Take a quick 1-minute tour to see how to give your parrot the best care.',
        icon: '🦜',
        targetTab: 'overview'
    },
    {
        title: 'Daily Training',
        description: 'Log your training sessions here. The AI will analyze your data to give you personalized coaching.',
        icon: '🎓',
        targetTab: 'training'
    },
    {
        title: 'Healthy Diet',
        description: 'Track what your parrot eats. Balanced nutrition is key to a happy bird.',
        icon: '🥜',
        targetTab: 'diet'
    },
    {
        title: 'Care Tasks',
        description: 'Manage daily routines like cleaning, water changes, and social time.',
        icon: '📋',
        targetTab: 'tasks'
    },
    {
        title: 'AI Insights',
        description: 'This is where the magic happens. View deep analysis of your parrot\'s progress and behavior.',
        icon: '🤖',
        targetTab: 'insights'
    }
];

interface AppTourProps {
    visible: boolean;
    onClose: () => void;
    onTabChange: (tab: string) => void;
}

export const AppTour: React.FC<AppTourProps> = ({ visible, onClose, onTabChange }) => {
    const { theme } = useTheme();
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);
            onTabChange(TOUR_STEPS[nextStep].targetTab);
        } else {
            onClose();
        }
    };

    const handleSkip = () => {
        onClose();
    };

    const step = TOUR_STEPS[currentStep];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.card, { backgroundColor: theme.isDark ? '#1F2937' : '#FFFFFF' }]}>
                    <View style={styles.header}>
                        <Text style={styles.icon}>{step.icon}</Text>
                        <Text style={[theme.typography.h2, { color: theme.colors.text }]}>
                            {step.title}
                        </Text>
                    </View>

                    <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 24 }]}>
                        {step.description}
                    </Text>

                    <View style={styles.footer}>
                        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                            <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
                                Skip
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.dots}>
                            {TOUR_STEPS.map((_, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.dot,
                                        { backgroundColor: i === currentStep ? theme.colors.brand.primary : theme.colors.border }
                                    ]}
                                />
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={handleNext}
                            style={[styles.nextButton, { backgroundColor: theme.colors.brand.primary }]}
                        >
                            <Text style={[theme.typography.body, { color: '#FFFFFF', fontWeight: '600' }]}>
                                {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
        padding: 16,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    icon: {
        fontSize: 48,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
    },
    skipButton: {
        padding: 8,
    },
    dots: {
        flexDirection: 'row',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    nextButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
});
