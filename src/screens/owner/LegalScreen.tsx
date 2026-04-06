import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card } from '../../components/Card';

const LegalScreen: React.FC = () => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.tabHeader}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'privacy' && { borderBottomColor: theme.colors.brand.primary, borderBottomWidth: 3 }]}
                    onPress={() => setActiveTab('privacy')}
                >
                    <Text style={[theme.typography.h3, { color: activeTab === 'privacy' ? theme.colors.brand.primary : theme.colors.textSecondary }]}>
                        Privacy Policy
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'terms' && { borderBottomColor: theme.colors.brand.primary, borderBottomWidth: 3 }]}
                    onPress={() => setActiveTab('terms')}
                >
                    <Text style={[theme.typography.h3, { color: activeTab === 'terms' ? theme.colors.brand.primary : theme.colors.textSecondary }]}>
                        Terms of Service
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {activeTab === 'privacy' ? (
                    <View style={styles.textSection}>
                        <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 16 }]}>Privacy Policy</Text>
                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 24 }]}>Effective Date: January 13, 2026</Text>

                        <Section title="1. Introduction">
                            BeakBuddy ("we," "us," or "our") is committed to protecting the privacy of our users. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
                        </Section>

                        <Section title="2. Information Collection">
                            <Text style={styles.subTitle}>A. Personal Data</Text>
                            {"\n"}We do not collect personal identification information (such as name, address, or email) unless you voluntarily provide it through our Support Ticketing system. The application operates primarily on a "Local-First" architecture.
                            {"\n\n"}
                            <Text style={styles.subTitle}>B. Avian Health & Training Data</Text>
                            {"\n"}All data related to your parrot's species, diet, training sessions, and health logs are stored directly on your device's local storage. We do not have access to this data in its raw form on our servers.
                        </Section>

                        <Section title="3. Third-Party Services & AI Processing">
                            <Text style={styles.subTitle}>A. Google Gemini AI</Text>
                            {"\n"}When utilizing the "AI Chat" or "AI Recommendations" features, certain anonymized segments of your care logs (e.g., training success rates, species type) are transmitted to the Google Gemini API to generate insights. This is required to generate customized insights. Google's use of this data is governed by the Google Privacy Policy.
                            {"\n\n"}
                            <Text style={styles.subTitle}>B. Firebase Hosting & Analytics</Text>
                            {"\n"}The web version of our app is hosted via Firebase. Basic technical metadata (IP address, browser type) may be logged by Firebase for security and performance monitoring.
                        </Section>

                        <Section title="4. Data Security">
                            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                        </Section>

                        <Section title="5. User Rights (GDPR/CCPA)">
                            Depending on your location, you may have the following rights:
                            {"\n"}• The right to access your data (available via "Export Profile Data").
                            {"\n"}• The right to rectification of inaccurate data.
                            {"\n"}• The right to erasure ("Right to be Forgotten") - achievable by deleting your profiles in-app.
                            {"\n"}• The right to restrict processing of AI-based features.
                        </Section>

                        <Section title="6. Children's Privacy">
                            We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
                        </Section>
                    </View>
                ) : (
                    <View style={styles.textSection}>
                        <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: 16 }]}>Terms and Conditions</Text>
                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 24 }]}>Last Updated: January 13, 2026</Text>

                        <Section title="1. Agreement to Terms">
                            By accessing or using BeakBuddy, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </Section>

                        <Section title="2. Medical & Veterinary Disclaimer">
                            <Text style={[styles.subTitle, { color: '#EF4444' }]}>CRITICAL NOTICE:</Text>
                            {"\n"}BEAKBUDDY IS NOT A VETERINARY SERVICE. The Application, including its AI-generated recommendations, provides educational and tracking tools only. It is not a substitute for professional veterinary advice, diagnosis, or treatment. Always seek the advice of a qualified avian veterinarian with any questions you may have regarding a medical condition of your pet. Never disregard professional advice or delay in seeking it because of something you have read in this Application.
                        </Section>

                        <Section title="3. Limitation of Liability">
                            In no event shall BeakBuddy, nor its directors, employees, partners, or agents, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of bird health, injury, or mortality, resulting from your access to or use of or inability to access or use the application.
                        </Section>

                        <Section title="4. User Accuracy">
                            You are responsible for the accuracy of the data you input. Incorrect data entry (e.g., wrong food safety status or training logs) may lead to incorrect AI recommendations. We are not responsible for decisions made based on such outputs.
                        </Section>

                        <Section title="5. Intellectual Property">
                            The Application and its original content (excluding user-generated profile data), features, and functionality are and will remain the exclusive property of BeakBuddy and its licensors.
                        </Section>

                        <Section title="6. Governing Law">
                            These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which the developer operates, without regard to its conflict of law provisions.
                        </Section>
                    </View>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
    const { theme } = useTheme();
    return (
        <View style={{ marginBottom: 24 }}>
            <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 8 }]}>{title}</Text>
            <Text style={[theme.typography.body, { color: theme.colors.textSecondary, lineHeight: 24 }]}>{children}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    textSection: {
        // No extra styles needed
    },
    subTitle: {
        fontWeight: '700',
        fontSize: 15,
        marginTop: 12,
    }
});

export default LegalScreen;
