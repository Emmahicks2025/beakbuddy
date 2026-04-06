import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export const MedicalDisclaimerLine: React.FC<{ style?: any }> = ({ style }) => {
    const { theme } = useTheme();
    return (
        <Text style={[styles.disclaimer, { color: theme.colors.textSecondary }, style]}>
            ⚠️ AI-powered. Not professional advice. Consult a vet for medical issues.
        </Text>
    );
};

const styles = StyleSheet.create({
    disclaimer: {
        fontSize: 10,
        textAlign: 'center',
        fontStyle: 'italic',
    }
});
