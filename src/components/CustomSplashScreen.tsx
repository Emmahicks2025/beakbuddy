import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Dimensions, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useTheme } from '../theme/ThemeContext';

const { width, height } = Dimensions.get('window');

const TIPS = [
    "Parrots are as smart as 5-year-old children!",
    "Interactive play builds long-lasting trust.",
    "BeakBuddy AI analyzes noises to detect stress.",
    "A clean cage is the foundation of parrot health.",
    "Green leafy vegetables are superfoods for birds.",
];

interface CustomSplashScreenProps {
    isReady: boolean;
    onFinish: () => void;
}

export const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({ isReady, onFinish }) => {
    const { theme } = useTheme();
    const [progress, setProgress] = useState(0);
    const [tipIndex, setTipIndex] = useState(0);

    // Core Animations
    const progressAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1.1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const tipFadeAnim = useRef(new Animated.Value(1)).current;

    // Element Stagger Animations
    const titleTranslateY = useRef(new Animated.Value(20)).current;
    const taglineTranslateY = useRef(new Animated.Value(20)).current;
    const loadingOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Hide native splash screen immediately to show our premium one
        SplashScreen.hideAsync().catch(() => { });

        // Sequential Entrance animation
        Animated.sequence([
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ]),
            Animated.stagger(200, [
                Animated.timing(titleTranslateY, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(taglineTranslateY, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(loadingOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ])
        ]).start();

        // Continuous Logo Pulse & Glow Rotation
        Animated.parallel([
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.04, duration: 2000, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
                ])
            ),
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 10000,
                    useNativeDriver: true,
                })
            )
        ]).start();

        // Tip rotation
        const tipInterval = setInterval(() => {
            Animated.timing(tipFadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                setTipIndex((prev) => (prev + 1) % TIPS.length);
                Animated.timing(tipFadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            });
        }, 4000);

        return () => clearInterval(tipInterval);
    }, []);

    // Progress Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (!isReady) {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return 90;
                    const increment = (90 - prev) * 0.05;
                    return Math.min(90, prev + Math.max(0.1, increment));
                });
            }, 100);
        } else {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(finish, 200);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 30);
        }

        return () => clearInterval(interval);
    }, [isReady]);

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const finish = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
        }).start(() => {
            onFinish();
        });
    };

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            {/* Base Native Image */}
            <Animated.Image
                source={require('../../assets/splash.png')}
                style={[
                    StyleSheet.absoluteFill,
                    { transform: [{ scale: scaleAnim }] }
                ]}
                resizeMode="cover"
            />

            {/* Dark Premium Overlay */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(5, 8, 20, 0.75)' }]} />

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Rotating Animated Glow Effect */}
                <Animated.View
                    style={[
                        styles.glowContainer,
                        { transform: [{ rotate: rotation }] }
                    ]}
                >
                    <View style={styles.glowItem} />
                </Animated.View>

                {/* Logo Section */}
                <Animated.View
                    style={[
                        styles.logoContainer,
                        { transform: [{ scale: pulseAnim }] }
                    ]}
                >
                    <Image
                        source={require('../../assets/app-logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Animated.View>

                {/* Brand Text Section */}
                <Animated.View style={{ transform: [{ translateY: titleTranslateY }] }}>
                    <Text style={styles.appName}>BeakBuddy</Text>
                </Animated.View>

                <Animated.View style={{ transform: [{ translateY: taglineTranslateY }] }}>
                    <Text style={styles.tagline}>Intelligent Parrot Care</Text>
                </Animated.View>

                {/* Loading System */}
                <Animated.View style={[styles.loadingContainer, { opacity: loadingOpacity }]}>
                    <View style={styles.progressInfo}>
                        <Text style={styles.loadingStatus}>
                            {progress >= 90 && !isReady
                                ? 'Finalizing configuration...'
                                : progress < 40 ? 'Initializing Engine' : progress < 80 ? 'Optimizing AI' : 'Securing Data'}
                        </Text>
                        <Text style={styles.percentage}>{Math.round(progress)}%</Text>
                    </View>

                    <View style={styles.loadingBarTrack}>
                        <Animated.View style={[styles.loadingBarFill, { width: progressWidth }]} />
                        <View style={styles.loadingBarGlow} />
                    </View>

                    {/* Pro Tip Card */}
                    <Animated.View style={[styles.tipCard, { opacity: tipFadeAnim }]}>
                        <Text style={styles.tipLabel}>SYSTEM TIP</Text>
                        <Text style={styles.tipText}>{TIPS[tipIndex]}</Text>
                    </Animated.View>
                </Animated.View>
            </Animated.View>

            {/* Version Footer */}
            <Text style={styles.versionText}>v{require('../../package.json').version} • UI REFRESH V2 • Safe & Secure</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050814',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    glowContainer: {
        position: 'absolute',
        width: 280,
        height: 280,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowItem: {
        width: '100%',
        height: '100%',
        borderRadius: 140,
        borderWidth: 2,
        borderColor: 'rgba(139, 92, 246, 0.15)',
        borderStyle: 'dashed',
    },
    logoContainer: {
        width: width * 0.5, // Allow more space for wide logo
        aspectRatio: 1080 / 589, // Match the logo asset exactly
        marginBottom: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    appName: {
        fontSize: 52, // Match StartScreen
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -1,
        marginBottom: 8,
        textAlign: 'center',
        textShadowColor: 'rgba(139, 92, 246, 0.6)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 20,
    },
    tagline: {
        fontSize: 16, // Slightly larger
        fontWeight: '700',
        color: '#8B5CF6',
        letterSpacing: 3,
        textTransform: 'uppercase',
        marginBottom: 60, // Move up
        textAlign: 'center',
        opacity: 0.9,
    },
    loadingContainer: {
        width: '100%',
        maxWidth: 340,
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 10,
    },
    loadingStatus: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    percentage: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '900',
    },
    loadingBarTrack: {
        height: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 5,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    loadingBarFill: {
        height: '100%',
        backgroundColor: '#B18AFA',
        borderRadius: 5,
    },
    loadingBarGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },
    tipCard: {
        marginTop: 40,
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
    },
    tipLabel: {
        color: '#8B5CF6',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    tipText: {
        color: '#FFFFFF',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
    },
    versionText: {
        position: 'absolute',
        bottom: 40,
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});

