import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card } from '../../components/Card';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const FAQS: FAQItem[] = [
    {
        category: 'General',
        question: 'How do I add multiple parrots?',
        answer: 'You can add another parrot by going to the Profile tab, tapping on your parrot card, and selecting "Add New Parrot".'
    },
    {
        category: 'General',
        question: 'Can I use this app on multiple devices?',
        answer: 'Currently, BeakBuddy stores data locally on your device. We are working on a cloud sync feature for future updates.'
    },
    {
        category: 'Training',
        question: 'How does AI Analysis work?',
        answer: 'Our AI analyzes the success rates, consistency, and mood logs of your training sessions to provide specific recommendations on timing and methods.'
    },
    {
        category: 'Training',
        question: 'What are "Milestones"?',
        answer: 'Milestones are key progress points in a training plan. Completing them unlocks deeper insights into your parrot\'s learning curve.'
    },
    {
        category: 'Diet',
        question: 'Is [X Food] safe for my parrot?',
        answer: 'Use the "Food Safety" (Search) tab to look up specific foods. We categorize them as Safe, Caution, or Toxic based on avian nutritional standards.'
    },
    {
        category: 'Diet',
        question: 'How do I log a meal?',
        answer: 'In the Care tab under "Diet", tap "Log Meal" to record what your parrot ate today.'
    },
    {
        category: 'Account',
        question: 'How do I delete my data?',
        answer: 'You can delete individual profiles in the Profile Selector, or clear all data in your device settings. For full account deletion requests, contact support.'
    }
];

const FAQScreen: React.FC = () => {
    const { theme } = useTheme();
    const [search, setSearch] = useState('');
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const filteredFaqs = FAQS.filter(f =>
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase()) ||
        f.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={[styles.searchInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                    placeholder="Search FAQ..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <ScrollView style={styles.scroll}>
                {filteredFaqs.map((faq, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
                        activeOpacity={0.7}
                    >
                        <Card style={styles.faqCard}>
                            <View style={styles.faqHeader}>
                                <View style={{ flex: 1 }}>
                                    <View style={[styles.categoryBadge, { backgroundColor: theme.colors.brand.primary + '15' }]}>
                                        <Text style={[theme.typography.caption, { color: theme.colors.brand.primary, fontSize: 10, fontWeight: '700' }]}>
                                            {faq.category.toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 4 }]}>
                                        {faq.question}
                                    </Text>
                                </View>
                                <Text style={{ fontSize: 18, color: theme.colors.textSecondary }}>
                                    {expandedIndex === index ? "▲" : "▼"}
                                </Text>
                            </View>
                            {expandedIndex === index && (
                                <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 12, lineHeight: 22 }]}>
                                    {faq.answer}
                                </Text>
                            )}
                        </Card>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchIcon: {
        position: 'absolute',
        left: 28,
        zIndex: 1,
        fontSize: 16,
    },
    searchInput: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderRadius: 12,
        paddingLeft: 44,
        paddingRight: 16,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    scroll: {
        paddingHorizontal: 16,
    },
    faqCard: {
        marginBottom: 12,
        padding: 16,
        borderRadius: 16,
    },
    faqHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    }
});

export default FAQScreen;
