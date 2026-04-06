import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface LoginModalProps {
    visible: boolean;
    onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ visible, onClose }) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password);
            }
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalOverlay}
            >
                <View style={[styles.modalContent, { backgroundColor: theme.colors.surfaceSolid, paddingBottom: insets.bottom + 20 }]}>
                    <View style={styles.header}>
                        <Text style={[theme.typography.h2, { color: theme.colors.text }]}>
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Email</Text>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                                color: theme.colors.text,
                                borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'
                            }]}
                            placeholder="Enter your email"
                            placeholderTextColor={theme.isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Password</Text>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                                color: theme.colors.text,
                                borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'
                            }]}
                            placeholder="Enter your password"
                            placeholderTextColor={theme.isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: theme.colors.brand.primary }]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    {isLogin ? 'Log In' : 'Sign Up'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.switchModeButton}
                            onPress={() => setIsLogin(!isLogin)}
                            disabled={isLoading}
                        >
                            <Text style={[styles.switchModeText, { color: theme.colors.brand.primary }]}>
                                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: 400,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    closeButton: {
        padding: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        height: 60,
        borderRadius: 18,
        paddingHorizontal: 20,
        borderWidth: 1,
        marginBottom: 24,
        fontSize: 16,
        fontWeight: '500',
    },
    submitButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    switchModeButton: {
        alignItems: 'center',
        padding: 8,
    },
    switchModeText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
