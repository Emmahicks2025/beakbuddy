import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { TrainingWizard } from '../../components/TrainingWizard';
import { TrainingPlanRepository } from '../../database/repository';
import { useProfileContext } from '../../context/ProfileContext';
import { AlertService } from '../../services/AlertService';

interface TrainingPlanWizardScreenProps {
    route?: {
        params?: {
            template: any;
        };
    };
}

const TrainingPlanWizardScreen: React.FC<TrainingPlanWizardScreenProps> = ({ route }) => {
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    const { activeProfile } = useProfileContext();
    const template = route?.params?.template;

    if (!template) {
        navigation.goBack();
        return null;
    }

    const handleComplete = async (planData: { title: string; goal: string; sessionsPerWeek: number; templateId: string }) => {
        if (!activeProfile) {
            AlertService.alert('Error', 'No active profile found');
            return;
        }

        try {
            await TrainingPlanRepository.create({
                profileId: activeProfile.id,
                title: planData.title,
                goal: planData.goal,
                sessionsPerWeek: planData.sessionsPerWeek,
                templateId: planData.templateId,
            });

            AlertService.alert('Success', `${planData.title} plan created!`);

            // Navigate back to Care tab (go back twice: wizard -> template selection -> care)
            navigation.navigate('OwnerTabs', { screen: 'Care' });
        } catch (error) {
            console.error('Failed to create training plan:', error);
            AlertService.alert('Error', 'Could not create training plan');
        }
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <TrainingWizard
                template={template}
                onComplete={handleComplete}
                onCancel={handleCancel}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default TrainingPlanWizardScreen;
