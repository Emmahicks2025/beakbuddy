import React, { useEffect } from 'react';
import { TouchableOpacity, Platform, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { StorageService } from '../services/StorageService';
import SubscriptionService from '../services/subscriptionService';
import { useProfileContext } from '../context/ProfileContext';

// Import screens
import SelectSpeciesScreen from '../screens/owner/SelectSpeciesScreen';
import CreateProfileScreen from '../screens/owner/CreateProfileScreen';
import { OwnerTabs } from './OwnerTabs';
import HelpScreen from '../screens/owner/HelpScreen';
import FAQScreen from '../screens/owner/FAQScreen';
import SupportTicketScreen from '../screens/owner/SupportTicketScreen';
import LegalScreen from '../screens/owner/LegalScreen';
import SubscriptionScreen from '../screens/owner/SubscriptionScreen';
import TrainingTemplateSelectionScreen from '../screens/owner/TrainingTemplateSelectionScreen';
import TrainingPlanWizardScreen from '../screens/owner/TrainingPlanWizardScreen';
import { GlobalAIChat } from '../components/GlobalAIChat';
import { VeterinaryDisclaimer } from '../components/VeterinaryDisclaimer';

const Stack = createNativeStackNavigator();

const TRIAL_OFFERED_KEY = 'trial_offered';

interface OwnerNavigatorProps {
    onBackToStart: () => void;
}

export const OwnerNavigator: React.FC<OwnerNavigatorProps> = ({ onBackToStart }) => {
    const { theme } = useTheme();
    const navigation = useNavigation();

    // Check if we should auto-prompt for trial
    useEffect(() => {
        const checkTrialPrompt = async () => {
            try {
                const hasSeenTrial = await StorageService.getItem(TRIAL_OFFERED_KEY);
                const hasSubscription = await SubscriptionService.hasActiveSubscription();

                console.log('Trial Check:', { hasSeenTrial, hasSubscription });

                // If first launch and no subscription, auto-navigate to subscription screen
                if (!hasSeenTrial && !hasSubscription) {
                    // Wait 1 second for UI to settle, then navigate
                    setTimeout(() => {
                        console.log('Auto-navigating to Subscription screen for trial');
                        (navigation as any).navigate('Subscription');
                        StorageService.setItem(TRIAL_OFFERED_KEY, 'true');
                    }, 1000);
                }
            } catch (error) {
                console.error('Error checking trial prompt:', error);
            }
        };

        checkTrialPrompt();
    }, []);

    const { allProfiles } = useProfileContext();
    const initialRoute = allProfiles.length > 0 ? 'OwnerTabs' : 'SelectSpecies';

    return (
        <View style={{ flex: 1 }}>
            <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={({ navigation }) => ({
                    headerStyle: {
                        backgroundColor: theme.colors.surfaceSolid,
                    },
                    headerTintColor: theme.colors.text,
                    headerTitleStyle: {
                        ...theme.typography.h3,
                        color: theme.colors.text, // Explicitly force color
                    },
                    headerBackTitleVisible: false,
                    contentStyle: { backgroundColor: theme.colors.background },
                    headerLeft: () => (
                        navigation.canGoBack() ? (
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={{
                                    padding: 10,
                                    marginLeft: -5,
                                    marginRight: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ fontSize: 22, color: theme.colors.text, fontWeight: '700' }}>←</Text>
                            </TouchableOpacity>
                        ) : null
                    ),
                    headerRight: () => {
                        const state = navigation.getState();
                        const currentRoute = state?.routes[state.index]?.name;
                        const isHelpOrLegal = ['Help', 'FAQ', 'SupportTicket', 'Legal'].includes(currentRoute);

                        return (navigation.canGoBack() && isHelpOrLegal) ? (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('OwnerTabs', { screen: 'Profile' })}
                                style={{
                                    padding: 10,
                                    marginRight: -5,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ fontSize: 20, color: theme.colors.text, fontWeight: '700' }}>✕</Text>
                            </TouchableOpacity>
                        ) : null;
                    },
                })}
            >
                <Stack.Screen
                    name="SelectSpecies"
                    component={SelectSpeciesScreen}
                    options={{ title: 'Select Your Parrot' }}
                />
                <Stack.Screen
                    name="CreateProfile"
                    component={CreateProfileScreen}
                    options={{ title: 'Create Profile' }}
                />
                <Stack.Screen
                    name="OwnerTabs"
                    options={{ headerShown: false }}
                >
                    {(props) => <OwnerTabs {...props} onBackToStart={onBackToStart} />}
                </Stack.Screen>
                <Stack.Screen
                    name="Help"
                    component={HelpScreen}
                    options={{ title: 'Help & Support' }}
                />
                <Stack.Screen
                    name="FAQ"
                    component={FAQScreen}
                    options={{ title: 'FAQ' }}
                />
                <Stack.Screen
                    name="SupportTicket"
                    component={SupportTicketScreen}
                    options={{ title: 'Contact Support' }}
                />
                <Stack.Screen
                    name="Legal"
                    component={LegalScreen}
                    options={{ title: 'Legal & Privacy' }}
                />
                <Stack.Screen
                    name="Subscription"
                    component={SubscriptionScreen}
                    options={{ title: 'Subscription' }}
                />
                <Stack.Screen
                    name="TrainingTemplateSelection"
                    component={TrainingTemplateSelectionScreen}
                    options={{ title: 'Training Programs' }}
                />
                <Stack.Screen
                    name="TrainingPlanWizard"
                    component={TrainingPlanWizardScreen}
                    options={{ title: 'Create Training Plan' }}
                />

            </Stack.Navigator>
            <GlobalAIChat />
            <VeterinaryDisclaimer />
        </View>
    );
};
