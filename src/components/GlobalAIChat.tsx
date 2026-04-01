import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import { AIChatModal } from './AIChatModal';
import { AppContext, GlobalChatService } from '../services/aiChat'; // Import service
import { useProfileContext } from '../context/ProfileContext';
import {
    ProfileRepository,
    TrainingPlanRepository,
    TrainingSessionRepository,
    DietPlanRepository,
    CareTaskRepository
} from '../database/repository';
import { ParrotProfile, TrainingPlan, TrainingSessionLog, DietPlan, CareTask } from '../types';

export const GlobalAIChat: React.FC = () => {
    const [showAIChat, setShowAIChat] = useState(false);
    const [showHelpBubble, setShowHelpBubble] = useState(true); // Default to true, we control visibility via component render
    const [isDismissed, setIsDismissed] = useState(false); // New state to control full dismissal
    const { activeProfile } = useProfileContext();
    const [contextData, setContextData] = useState<AppContext>({
        profile: null,
        plans: [],
        sessions: [],
        diet: null,
        tasks: []
    });

    // Listen for restoration events
    useEffect(() => {
        const unsubscribe = GlobalChatService.subscribe(() => {
            setIsDismissed(false);
            setShowHelpBubble(true);
        });
        return unsubscribe;
    }, []);

    // If no active profile (e.g. onboarding) or user dismissed, do not render anything
    if (!activeProfile || isDismissed) {
        return null;
    }

    // Load data when opening chat to ensure freshness
    const loadContextData = async () => {
        try {
            // We use activeProfile from context, so we don't need to fetch profiles again

            if (activeProfile) {
                const [plans, sessions, diet, tasks] = await Promise.all([
                    TrainingPlanRepository.getByProfile(activeProfile.id),
                    TrainingSessionRepository.getByProfile(activeProfile.id),
                    DietPlanRepository.getByProfile(activeProfile.id),
                    CareTaskRepository.getByProfile(activeProfile.id)
                ]);

                setContextData({
                    profile: activeProfile,
                    plans,
                    sessions,
                    diet,
                    tasks
                });
            }
        } catch (error) {
            console.error('Failed to load global chat context', error);
        }
    };

    const handleOpenChat = async () => {
        await loadContextData();
        setShowAIChat(true);
        setShowHelpBubble(false); // Hide bubble once clicked
    };

    return (
        <View style={styles.container} pointerEvents="box-none">
            <View style={styles.fabContainer}>
                <TouchableOpacity
                    onPress={handleOpenChat}
                    activeOpacity={0.8}
                >
                    <View style={styles.iconWrapper}>
                        <Image
                            source={require('../../assets/parrot-ai-icon.png')}
                            style={styles.icon}
                            resizeMode="contain"
                        />
                    </View>
                </TouchableOpacity>

                {/* Help Bubble Prompt */}
                {showHelpBubble && (
                    <View style={styles.helpBubble}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity
                                onPress={handleOpenChat}
                                style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                            >
                                <Text style={styles.helpText}>Need help? 💬</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setIsDismissed(true)} // Closes the entire widget as requested
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                style={{ marginLeft: 6, opacity: 0.6 }}
                            >
                                <Text style={{ fontSize: 16, color: '#000', fontWeight: 'bold' }}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        {/* Triangle Pointer */}
                        <View style={styles.triangle} />
                    </View>
                )}
            </View>

            <AIChatModal
                visible={showAIChat}
                // @ts-ignore
                onClose={() => {
                    setShowAIChat(false);
                    setShowHelpBubble(true); // Bring back help bubble for next interaction or dismissal
                }}
                context={contextData}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        zIndex: 9999,
        elevation: 9999,
    },
    fabContainer: {
        marginBottom: 90, // Raised to clear tab bar more safely
        marginRight: 16,
        alignItems: 'flex-end',
    },
    iconWrapper: {
        width: 90,
        height: 90,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 90,
        height: 90,
    },
    helpBubble: {
        position: 'absolute',
        bottom: 100, // Aligned with the larger 90px icon
        right: 0,
        backgroundColor: '#FFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.1)',
        width: 130
    },
    helpText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6366F1',
        textAlign: 'center',
        flex: 1
    },
    triangle: {
        position: 'absolute',
        bottom: -6,
        right: 20,
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#FFF',
    }
});
