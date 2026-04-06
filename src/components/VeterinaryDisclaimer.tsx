import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Button } from './Button';
import { StorageService } from '../services/StorageService';

export const VeterinaryDisclaimer: React.FC = () => {
    const { theme } = useTheme();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        checkDisclaimer();
    }, []);

    const checkDisclaimer = async () => {
        const hasAccepted = await StorageService.getItem('@disclaimer_accepted');
        if (!hasAccepted) {
            setVisible(true);
        }
    };

    const handleAccept = async () => {
        await StorageService.setItem('@disclaimer_accepted', 'true');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={handleAccept}
        >
            <View style={styles.overlay}>
                <View style={[styles.modal, { backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderWidth: 1 }]}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>⚠️ Veterinary Disclaimer</Text>

                    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                        <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
                            BeakBuddy is an AI-powered educational tool designed to assist with parrot training and care.
                            {"\n\n"}
                            <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>Not a Diagnostic Tool:</Text> Results from the Food Scanner, AI Chat, and Care Insights are for informational purposes only. They do <Text style={{ fontWeight: 'bold' }}>NOT</Text> constitute professional veterinary advice, diagnosis, or treatment.
                            {"\n\n"}
                            <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>AI Limitations:</Text> Artificial Intelligence can make mistakes. Never rely solely on AI to determine if a food is safe or if a bird is healthy.
                            {"\n\n"}
                            <Text style={{ fontWeight: 'bold', color: theme.colors.brand.toxic }}>Emergency & Health:</Text> If your bird has ingested a known toxin or is showing signs of illness (lethargy, puffed feathers, labored breathing), contact an avian veterinarian <Text style={{ fontWeight: 'bold' }}>IMMEDIATELY</Text>.
                            {"\n\n"}
                            By using this app, you acknowledge that you are responsible for your bird's health and will consult professionals for medical concerns.
                        </Text>
                    </ScrollView>

                    <Button
                        title="I Understand & Accept"
                        onPress={handleAccept}
                        style={styles.button}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    modal: {
        width: '100%',
        maxHeight: '70%',
        borderRadius: 28,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 20,
        textAlign: 'center'
    },
    scroll: {
        marginBottom: 24
    },
    text: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center'
    },
    button: {
        width: '100%'
    }
});
