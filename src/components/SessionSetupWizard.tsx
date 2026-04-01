import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Card } from './Card';
import { Button } from './Button';

interface SessionSetupWizardProps {
    onComplete: (setupData: SessionSetupData) => void;
    onCancel: () => void;
}

export interface SessionSetupData {
    birdMoodBefore: 'calm' | 'excited' | 'distracted' | 'tired';
    energyLevel: 'high' | 'medium' | 'low';
    hungerLevel: 'very-hungry' | 'hungry' | 'satisfied' | 'full';
    environmentQuality: 'quiet' | 'some-distractions' | 'noisy';
    trainingMethod: 'clicker' | 'target' | 'shaping' | 'luring' | 'capturing' | 'other';
    reinforcementType: string;
}

export const SessionSetupWizard: React.FC<SessionSetupWizardProps> = ({ onComplete, onCancel }) => {
    const { theme } = useTheme();
    const [step, setStep] = useState(1);

    // Step 1: Bird readiness
    const [birdMood, setBirdMood] = useState<'calm' | 'excited' | 'distracted' | 'tired'>('calm');
    const [energyLevel, setEnergyLevel] = useState<'high' | 'medium' | 'low'>('medium');
    const [hungerLevel, setHungerLevel] = useState<'very-hungry' | 'hungry' | 'satisfied' | 'full'>('hungry');
    const [environment, setEnvironment] = useState<'quiet' | 'some-distractions' | 'noisy'>('quiet');

    // Step 2: Training setup
    const [method, setMethod] = useState<'clicker' | 'target' | 'shaping' | 'luring' | 'capturing' | 'other'>('clicker');
    const [reinforcement, setReinforcement] = useState('sunflower seeds');

    const handleNext = () => {
        if (step === 1) {
            setStep(2);
        } else {
            onComplete({
                birdMoodBefore: birdMood,
                energyLevel,
                hungerLevel,
                environmentQuality: environment,
                trainingMethod: method,
                reinforcementType: reinforcement
            });
        }
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
        } else {
            onCancel();
        }
    };

    const OptionButton = ({
        label,
        icon,
        selected,
        onPress
    }: {
        label: string;
        icon: string;
        selected: boolean;
        onPress: () => void;
    }) => (
        <TouchableOpacity
            style={[
                styles.optionButton,
                {
                    backgroundColor: selected ? theme.colors.brand.primary + '20' : theme.colors.surface,
                    borderColor: selected ? theme.colors.brand.primary : theme.colors.border,
                }
            ]}
            onPress={onPress}
        >
            <Text style={styles.optionIcon}>{icon}</Text>
            <Text style={[
                theme.typography.body,
                { color: selected ? theme.colors.brand.primary : theme.colors.text, fontWeight: selected ? '600' : '400' }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <View style={styles.header}>
                    <Text style={[theme.typography.h2, { color: theme.colors.text }]}>
                        Session Setup
                    </Text>
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                        Step {step} of 2
                    </Text>
                </View>

                {step === 1 && (
                    <View style={styles.stepContent}>
                        <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 16 }]}>
                            🦜 Bird Readiness Assessment
                        </Text>

                        <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginBottom: 8 }]}>
                            Current Mood
                        </Text>
                        <View style={styles.optionGrid}>
                            <OptionButton label="Calm" icon="😌" selected={birdMood === 'calm'} onPress={() => setBirdMood('calm')} />
                            <OptionButton label="Excited" icon="🤩" selected={birdMood === 'excited'} onPress={() => setBirdMood('excited')} />
                            <OptionButton label="Distracted" icon="👀" selected={birdMood === 'distracted'} onPress={() => setBirdMood('distracted')} />
                            <OptionButton label="Tired" icon="😴" selected={birdMood === 'tired'} onPress={() => setBirdMood('tired')} />
                        </View>

                        <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginBottom: 8, marginTop: 16 }]}>
                            Energy Level
                        </Text>
                        <View style={styles.optionGrid}>
                            <OptionButton label="High" icon="⚡" selected={energyLevel === 'high'} onPress={() => setEnergyLevel('high')} />
                            <OptionButton label="Medium" icon="🔋" selected={energyLevel === 'medium'} onPress={() => setEnergyLevel('medium')} />
                            <OptionButton label="Low" icon="🪫" selected={energyLevel === 'low'} onPress={() => setEnergyLevel('low')} />
                        </View>

                        <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginBottom: 8, marginTop: 16 }]}>
                            Hunger Level
                        </Text>
                        <View style={styles.optionGrid}>
                            <OptionButton label="Very Hungry" icon="🍽️" selected={hungerLevel === 'very-hungry'} onPress={() => setHungerLevel('very-hungry')} />
                            <OptionButton label="Hungry" icon="🥜" selected={hungerLevel === 'hungry'} onPress={() => setHungerLevel('hungry')} />
                            <OptionButton label="Satisfied" icon="😊" selected={hungerLevel === 'satisfied'} onPress={() => setHungerLevel('satisfied')} />
                            <OptionButton label="Full" icon="😌" selected={hungerLevel === 'full'} onPress={() => setHungerLevel('full')} />
                        </View>

                        <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginBottom: 8, marginTop: 16 }]}>
                            Environment
                        </Text>
                        <View style={styles.optionGrid}>
                            <OptionButton label="Quiet" icon="🤫" selected={environment === 'quiet'} onPress={() => setEnvironment('quiet')} />
                            <OptionButton label="Some Distractions" icon="👂" selected={environment === 'some-distractions'} onPress={() => setEnvironment('some-distractions')} />
                            <OptionButton label="Noisy" icon="🔊" selected={environment === 'noisy'} onPress={() => setEnvironment('noisy')} />
                        </View>
                    </View>
                )}

                {step === 2 && (
                    <View style={styles.stepContent}>
                        <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 16 }]}>
                            🎯 Training Method
                        </Text>

                        <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginBottom: 8 }]}>
                            Select Method
                        </Text>
                        <View style={styles.optionGrid}>
                            <OptionButton label="Clicker Training" icon="🔔" selected={method === 'clicker'} onPress={() => setMethod('clicker')} />
                            <OptionButton label="Target Training" icon="🎯" selected={method === 'target'} onPress={() => setMethod('target')} />
                            <OptionButton label="Shaping" icon="📐" selected={method === 'shaping'} onPress={() => setMethod('shaping')} />
                            <OptionButton label="Luring" icon="🍬" selected={method === 'luring'} onPress={() => setMethod('luring')} />
                            <OptionButton label="Capturing" icon="📸" selected={method === 'capturing'} onPress={() => setMethod('capturing')} />
                            <OptionButton label="Other" icon="✨" selected={method === 'other'} onPress={() => setMethod('other')} />
                        </View>

                        <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginBottom: 8, marginTop: 16 }]}>
                            Primary Reinforcement
                        </Text>
                        <View style={styles.optionGrid}>
                            <OptionButton
                                label="Sunflower Seeds"
                                icon="🌻"
                                selected={reinforcement === 'sunflower seeds'}
                                onPress={() => setReinforcement('sunflower seeds')}
                            />
                            <OptionButton
                                label="Nuts"
                                icon="🥜"
                                selected={reinforcement === 'nuts'}
                                onPress={() => setReinforcement('nuts')}
                            />
                            <OptionButton
                                label="Fruits"
                                icon="🍇"
                                selected={reinforcement === 'fruits'}
                                onPress={() => setReinforcement('fruits')}
                            />
                            <OptionButton
                                label="Verbal Praise"
                                icon="💬"
                                selected={reinforcement === 'verbal praise'}
                                onPress={() => setReinforcement('verbal praise')}
                            />
                            <OptionButton
                                label="Head Scratches"
                                icon="🤲"
                                selected={reinforcement === 'head scratches'}
                                onPress={() => setReinforcement('head scratches')}
                            />
                            <OptionButton
                                label="Favorite Toy"
                                icon="🎾"
                                selected={reinforcement === 'favorite toy'}
                                onPress={() => setReinforcement('favorite toy')}
                            />
                        </View>

                        <View style={[styles.tipBox, { backgroundColor: theme.colors.brand.primary + '10' }]}>
                            <Text style={[theme.typography.caption, { color: theme.colors.brand.primary, fontWeight: '600' }]}>
                                💡 Pro Tip
                            </Text>
                            <Text style={[theme.typography.bodySmall, { color: theme.colors.text, marginTop: 4 }]}>
                                Use high-value treats when teaching new behaviors. Save lower-value rewards for maintaining already-learned skills.
                            </Text>
                        </View>
                    </View>
                )}

                <View style={styles.actions}>
                    <Button
                        title={step === 1 ? "Cancel" : "Back"}
                        onPress={handleBack}
                        variant="secondary"
                        style={{ flex: 1, marginRight: 8 }}
                    />
                    <Button
                        title={step === 2 ? "Start Session" : "Next"}
                        onPress={handleNext}
                        style={{ flex: 1 }}
                    />
                </View>
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // Force solid background as this renders in a full-screen Modal
        backgroundColor: '#F9FAFB',
    },
    card: {
        padding: 16,
        margin: 16,
    },
    header: {
        marginBottom: 24,
    },
    stepContent: {
        marginBottom: 24,
    },
    optionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
        gap: 8,
        minWidth: '48%',
        flex: 1,
    },
    optionIcon: {
        fontSize: 20,
    },
    tipBox: {
        padding: 12,
        borderRadius: 12,
        marginTop: 16,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
});
