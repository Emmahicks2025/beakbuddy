import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Card } from './Card';
import { TrainingTemplate, getDifficultyColor } from '../utils/trainingTemplates';

interface TrainingTemplateCardProps {
    template: TrainingTemplate;
    onSelect: (template: TrainingTemplate) => void;
    isAlreadyActive?: boolean;
}

export const TrainingTemplateCard: React.FC<TrainingTemplateCardProps> = ({ template, onSelect, isAlreadyActive }) => {
    const { theme } = useTheme();
    const difficultyColor = getDifficultyColor(template.difficulty);

    return (
        <TouchableOpacity
            onPress={() => !isAlreadyActive && onSelect(template)}
            activeOpacity={isAlreadyActive ? 1 : 0.7}
            disabled={isAlreadyActive}
        >
            <Card style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>{template.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                            {template.title}
                        </Text>
                        <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                            {template.description}
                        </Text>
                    </View>
                </View>

                <View style={styles.metaRow}>
                    <View style={[styles.badge, { backgroundColor: difficultyColor + '20' }]}>
                        <Text style={[theme.typography.caption, { color: difficultyColor, fontWeight: '600' }]}>
                            {template.difficulty}
                        </Text>
                    </View>
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                        ⏱️ {template.duration}
                    </Text>
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                        📅 {template.sessionsPerWeek}x/week
                    </Text>
                </View>

                <View style={styles.milestonesPreview}>
                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 6 }]}>
                        {template.milestones.length} milestones
                    </Text>
                    <View style={styles.milestonesDots}>
                        {template.milestones.slice(0, 6).map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.milestoneDot,
                                    { backgroundColor: theme.colors.border }
                                ]}
                            />
                        ))}
                    </View>
                </View>

                <View style={[
                    styles.selectButton,
                    { backgroundColor: isAlreadyActive ? theme.colors.textSecondary : theme.colors.brand.primary }
                ]}>
                    <Text style={[theme.typography.bodySmall, { color: '#FFFFFF', fontWeight: '600' }]}>
                        {isAlreadyActive ? 'Active Plan' : 'Start This Program →'}
                    </Text>
                </View>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(128, 64, 191, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 28,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    milestonesPreview: {
        marginBottom: 12,
    },
    milestonesDots: {
        flexDirection: 'row',
        gap: 6,
    },
    milestoneDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    selectButton: {
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
});
