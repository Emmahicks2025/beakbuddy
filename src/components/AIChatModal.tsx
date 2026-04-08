import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ChatMessage, AppContext, sendChatToAI } from '../services/aiChat'; // Import service
// Removed Ionicons for Web compatibility
import { ParrotProfile, TrainingPlan, TrainingSessionLog, DietPlan, CareTask } from '../types';

interface AIChatModalProps {
    visible: boolean;
    onClose: () => void;
    context: AppContext;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ visible, onClose, context }) => {
    const { theme } = useTheme();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Initial greeting
    useEffect(() => {
        if (visible && messages.length === 0) {
            setMessages([
                {
                    id: 'init-1',
                    role: 'assistant',
                    text: `Hi! I'm your Parrot Assistant 🦜. Ask me anything about ${context.profile?.displayName || 'your bird'}'s training, diet, or care!`,
                    timestamp: Date.now()
                }
            ]);
        }
    }, [visible]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: inputText.trim(),
            timestamp: Date.now()
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputText('');
        setLoading(true);

        try {
            const responseText = await sendChatToAI(newMessages, context);

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: responseText,
                timestamp: Date.now()
            };

            setMessages([...newMessages, aiMsg]);
        } catch (error: any) {
            console.error('Chat error in UI:', error);
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: `❌ Error: ${error.message || 'Something went wrong while talking to the AI.'}`,
                timestamp: Date.now()
            };
            setMessages([...newMessages, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setMessages([]); // Clear chat history
        setInputText(''); // Clear input
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <Pressable
                style={styles.modalOverlay}
                onPress={handleClose}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={[
                        styles.contentWrapper,
                        { backgroundColor: theme.isDark ? '#111827' : '#FFFFFF' },
                    ]}
                >
                    <Pressable style={{ flex: 1 }}>
                        {/* Header */}
                        <View style={[
                            styles.header,
                            {
                                backgroundColor: theme.colors.brand.primary,
                                borderBottomColor: 'rgba(255,255,255,0.1)'
                            }
                        ]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 24 }}>🦜</Text>
                                </View>
                                <View>
                                    <Text style={[theme.typography.h3, { color: '#FFF', fontSize: 18, fontWeight: '700' }]}>
                                        Parrot Assistant
                                    </Text>
                                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{'Online & Ready to help'}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                                <Text style={{ fontSize: 20, color: '#FFF', fontWeight: 'bold' }}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Chat Area */}
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.chatArea}
                            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                        >
                            {messages.map((msg) => (
                                <View
                                    key={msg.id}
                                    style={[
                                        styles.bubble,
                                        msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
                                        msg.role === 'user'
                                            ? { backgroundColor: theme.colors.brand.primary }
                                            : {
                                                backgroundColor: theme.isDark ? 'rgba(30, 41, 59, 0.8)' : '#F8FAFC',
                                                borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                                            },
                                        { ...theme.shadows.card }
                                    ]}
                                >
                                    <Text style={[
                                        theme.typography.body,
                                        {
                                            color: msg.role === 'user' ? '#FFF' : theme.colors.text,
                                            fontSize: 15,
                                            lineHeight: 22
                                        }
                                    ]}>
                                        {msg.text}
                                    </Text>
                                </View>
                            ))}
                            {loading && (
                                <View style={[styles.bubble, styles.assistantBubble, { backgroundColor: theme.isDark ? 'rgba(30, 41, 59, 0.8)' : '#F8FAFC', width: 60, alignItems: 'center' }]}>
                                    <ActivityIndicator size="small" color={theme.colors.brand.primary} />
                                </View>
                            )}
                        </ScrollView>

                        {/* Input Area */}
                        <View style={[styles.inputArea, { borderTopColor: theme.colors.glassBorder, backgroundColor: theme.isDark ? '#1F2937' : '#FFFFFF' }]}>
                            <TextInput
                                style={[styles.input, theme.typography.body, {
                                    backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
                                    color: theme.colors.text,
                                    borderColor: theme.colors.border
                                }]}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Ask about diet, training..."
                                placeholderTextColor={theme.colors.textSecondary}
                                onSubmitEditing={handleSend}
                            />
                            <TouchableOpacity
                                onPress={handleSend}
                                style={[
                                    styles.sendBtn,
                                    { backgroundColor: inputText.trim() ? theme.colors.brand.primary : theme.colors.border }
                                ]}
                                disabled={!inputText.trim()}
                            >
                                <Text style={{ fontSize: 14, color: '#FFF', fontWeight: 'bold' }}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </KeyboardAvoidingView>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.15)',
        justifyContent: Platform.OS === 'web' ? 'flex-end' : 'center',
        alignItems: Platform.OS === 'web' ? 'flex-end' : 'center',
        padding: Platform.OS === 'web' ? 24 : 0,
    },
    contentWrapper: {
        width: Platform.OS === 'web' ? 400 : '95%',
        maxWidth: 500,
        height: Platform.OS === 'web' ? 600 : '90%',
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    closeBtn: {
        padding: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
    },
    chatArea: {
        flex: 1,
    },
    bubble: {
        maxWidth: '85%',
        padding: 14,
        paddingHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    userBubble: {
        alignSelf: 'flex-end',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 4,
        borderColor: 'transparent',
    },
    assistantBubble: {
        alignSelf: 'flex-start',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 4,
    },
    inputArea: {
        flexDirection: 'row',
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        alignItems: 'center',
        gap: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 12,
        maxHeight: 120,
        fontSize: 15,
    },
    sendBtn: {
        paddingHorizontal: 20,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
});
