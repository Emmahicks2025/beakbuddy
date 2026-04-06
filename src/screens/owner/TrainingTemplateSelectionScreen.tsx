import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { TRAINING_TEMPLATES, TrainingTemplate } from '../../utils/trainingTemplates';
import { TrainingTemplateCard } from '../../components/TrainingTemplateCard';

interface TrainingTemplateSelectionScreenProps {
    route?: {
        params?: {
            activeTemplateIds?: string[];
        };
    };
}

const TrainingTemplateSelectionScreen: React.FC<TrainingTemplateSelectionScreenProps> = ({ route }) => {
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    const activeTemplateIds = route?.params?.activeTemplateIds || [];

    const handleSelectTemplate = (template: TrainingTemplate) => {
        navigation.navigate('TrainingPlanWizard', { template });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 8 }]}>
                    Training Programs
                </Text>
                <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: 24 }]}>
                    Choose a structured program to guide your parrot's development
                </Text>

                {TRAINING_TEMPLATES.map((template) => (
                    <TrainingTemplateCard
                        key={template.id}
                        template={template}
                        onSelect={handleSelectTemplate}
                        isAlreadyActive={activeTemplateIds.includes(template.id)}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
});

export default TrainingTemplateSelectionScreen;
