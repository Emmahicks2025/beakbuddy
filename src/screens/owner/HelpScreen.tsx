import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card } from '../../components/Card';

const HelpScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { theme } = useTheme();

    const menuItems = [
        {
            title: 'FAQ',
            subtitle: 'Frequently Asked Questions',
            emoji: '❓',
            screen: 'FAQ',
            color: theme.colors.brand.primary
        },
        {
            title: 'Contact Support',
            subtitle: 'Open a support ticket',
            emoji: '✉️',
            screen: 'SupportTicket',
            color: theme.colors.brand.safe
        }
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[theme.typography.h1, { color: theme.colors.text, textAlign: 'center', fontWeight: '800' }]}>
                        How can we help?
                    </Text>
                    <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8 }]}>
                        Find answers or get in touch with our team.
                    </Text>
                </View>

                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => navigation.navigate(item.screen)}
                        activeOpacity={0.7}
                    >
                        <Card style={styles.menuCard}>
                            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                                <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                            </View>
                            <View style={styles.menuText}>
                                <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                                    {item.title}
                                </Text>
                                <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]}>
                                    {item.subtitle}
                                </Text>
                            </View>
                            <Text style={{ fontSize: 18, color: theme.colors.textSecondary }}>›</Text>
                        </Card>
                    </TouchableOpacity>
                ))}

                <Card style={styles.infoCard}>
                    <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 8 }]}>
                        🚑 Emergency Info
                    </Text>
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, lineHeight: 18 }]}>
                        If your parrot is having a medical emergency, please contact your nearest avian veterinarian immediately.
                        This app is for tracking and educational purposes only.
                    </Text>
                </Card>
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
    header: {
        marginVertical: 32,
    },
    menuCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        borderRadius: 20,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuText: {
        flex: 1,
    },
    infoCard: {
        marginTop: 24,
        padding: 24,
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 24,
    },
});

export default HelpScreen;
