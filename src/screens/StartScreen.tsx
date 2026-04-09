import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, Animated, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import Svg, { Path } from 'react-native-svg';
import { LoginModal } from '../components/LoginModal';
import { Ionicons } from '@expo/vector-icons';

interface StartScreenProps {
    navigation: any;
}

const { width, height } = Dimensions.get('window');

const GoogleIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24">
        <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </Svg>
);

const StartScreen: React.FC<StartScreenProps> = ({ navigation }) => {
    const { theme } = useTheme();
    const { loginWithGoogle, loginWithApple } = useAuth();
    const insets = useSafeAreaInsets();
    const [showEmailModal, setShowEmailModal] = useState(false);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const blob1Anim = useRef(new Animated.Value(0)).current;
    const blob2Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Background blob animations
        const createBlobAnim = (anim: Animated.Value) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, { toValue: 1, duration: 15000, useNativeDriver: true }),
                    Animated.timing(anim, { toValue: 0, duration: 15000, useNativeDriver: true }),
                ])
            ).start();
        };

        createBlobAnim(blob1Anim);
        createBlobAnim(blob2Anim);
    }, []);

    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (error) {
            console.error('Google login error:', error);
        }
    };

    const handleAppleLogin = async () => {
        try {
            await loginWithApple();
        } catch (error) {
            console.error('Apple login error:', error);
        }
    };

    const blob1Style = {
        transform: [
            { translateX: blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 20] }) },
            { translateY: blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [-30, 30] }) },
            { scale: blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) },
        ],
    };

    const blob2Style = {
        transform: [
            { translateX: blob2Anim.interpolate({ inputRange: [0, 1], outputRange: [20, -20] }) },
            { translateY: blob2Anim.interpolate({ inputRange: [0, 1], outputRange: [30, -30] }) },
            { scale: blob2Anim.interpolate({ inputRange: [0, 1], outputRange: [1.1, 0.9] }) },
        ],
    };

    return (
        <View style={styles.container}>
            {/* Professional Background */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#050814' }]} />

            {/* Animated Blobs for Modern UI */}
            <Animated.View style={[styles.blob, styles.blob1, blob1Style]} />
            <Animated.View style={[styles.blob, styles.blob2, blob2Style]} />

            <LinearGradient
                colors={['rgba(5, 8, 20, 0)', 'rgba(5, 8, 20, 0.9)', '#050814']}
                style={StyleSheet.absoluteFill}
            />

            <View style={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
                {/* Hero Section */}
                <Animated.View style={[
                    styles.heroContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}>
                    <View style={styles.imageShadow}>
                        <Image
                            source={require('../../assets/parrot_hero.png')}
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(5, 8, 20, 0.8)']}
                            style={StyleSheet.absoluteFill}
                        />
                    </View>
                </Animated.View>

                {/* Text Section */}
                <Animated.View style={[
                    styles.textContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}>
                    <View style={styles.glassCard}>
                        <Text style={styles.brandName}>BeakBuddy</Text>
                        <Text style={styles.tagline}>The Ultimate AI Ecosystem for Your Avian Companion</Text>
                    </View>
                </Animated.View>

                {/* Action Section */}
                <Animated.View style={[
                    styles.actionContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => {
                            handleGoogleLogin();
                        }}
                        activeOpacity={0.85}
                    >
                        <View style={styles.buttonContent}>
                            <GoogleIcon />
                            <Text style={styles.buttonText}>Get Started with Google</Text>
                        </View>
                    </TouchableOpacity>
                    
                    {Platform.OS === 'ios' && (
                        <TouchableOpacity
                            style={[styles.primaryButton, { marginTop: 12 }]}
                            onPress={handleAppleLogin}
                            activeOpacity={0.85}
                        >
                            <View style={styles.buttonContent}>
                                <Ionicons name="logo-apple" size={24} color="#000" style={{ marginRight: 12 }} />
                                <Text style={styles.buttonText}>Continue with Apple</Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.primaryButton, styles.emailButton]}
                        onPress={() => setShowEmailModal(true)}
                        activeOpacity={0.85}
                    >
                        <View style={styles.buttonContent}>
                            <Ionicons name="mail" size={20} color="#fff" style={{ marginRight: 12 }} />
                            <Text style={[styles.buttonText, { color: '#fff' }]}>Continue with Email</Text>
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.disclaimerText}>
                        Your AI Parrot Expert • <Text style={styles.linkText}>BeakBuddy</Text>
                    </Text>
                </Animated.View>
            </View>

            <LoginModal
                visible={showEmailModal}
                onClose={() => setShowEmailModal(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050814',
    },
    blob: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        borderRadius: width,
        opacity: 0.2,
    },
    blob1: {
        backgroundColor: '#8B5CF6',
        top: -height * 0.2,
        left: -width * 0.5,
    },
    blob2: {
        backgroundColor: '#3B82F6',
        bottom: -height * 0.2,
        right: -width * 0.5,
    },
    content: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 24, // More room for glass card
    },
    heroContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.65,
    },
    imageShadow: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        marginBottom: 40,
        zIndex: 10,
    },
    glassCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 32,
        paddingHorizontal: 24,
        paddingVertical: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    brandName: {
        fontSize: 42,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -1,
        textAlign: 'center',
        textShadowColor: 'rgba(139, 92, 246, 0.8)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 20,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
        lineHeight: 26,
        marginTop: 4,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    actionContainer: {
        width: '100%',
        marginTop: 10,
    },
    primaryButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        height: 68,
        justifyContent: 'center',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 12,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        marginLeft: 14,
    },
    emailButton: {
        marginTop: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    disclaimerText: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        marginTop: 32,
        fontWeight: '500',
    },
    linkText: {
        color: '#9F67FF',
        fontWeight: '700',
    },
});

export default StartScreen;
