import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SUBSCRIPTION_TIERS, SubscriptionProduct } from '../../types/subscription';
import SubscriptionService from '../../services/subscriptionService';
import { AlertService } from '../../services/AlertService';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useProfileContext } from '../../context/ProfileContext';
import { ProfileRepository } from '../../database/repository';
import { getSpeciesImage } from '../../utils/imageMap';
import { Image } from 'react-native';

interface SubscriptionScreenProps {
    navigation: any;
}

interface SubscriptionStatus {
    isActive: boolean;
    willRenew: boolean;
    isInTrialPeriod: boolean;
}

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ navigation }) => {
    const { theme } = useTheme();
    const { activeProfile, switchProfile } = useProfileContext();
    const [loading, setLoading] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({ isActive: false, willRenew: false, isInTrialPeriod: false });
    const [offerings, setOfferings] = useState<any>(null);

    useEffect(() => {
        checkStatus();
        loadOfferings();
    }, []);

    const loadOfferings = async () => {
        try {
            const data = await SubscriptionService.getOfferings();
            setOfferings(data);
        } catch (e) {
            console.error('Failed to load offerings', e);
        }
    };

    const checkStatus = async () => {
        const status = await SubscriptionService.getSubscriptionStatus();
        setSubscriptionStatus(status);
    };

    const handlePurchase = async (pkg: any) => {
        try {
            setLoading(true);
            const { userCancelled } = await SubscriptionService.purchaseSubscription(pkg);
            if (!userCancelled) {
                await checkStatus();
                AlertService.alert('Success', 'Welcome to BeakBuddy Pro!');
            }
        } catch (error: any) {
            AlertService.alert('Error', error.message || 'Purchase failed');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadPhoto = async () => {
        if (!activeProfile) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                const imageUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;

                setLoading(true);
                await ProfileRepository.update(activeProfile.id, { avatarAsset: imageUri });
                // Force context refresh by switching to same profile or similar (if Context supports it)
                // ProfileContext usually listens to DB or we can manually refresh
                // For now, let's just alert success
                AlertService.alert('Success', 'Your bird\'s photo has been updated!');

                // Hack to refresh local active profile if possible, though switchProfile(activeProfile.id) might work
                await switchProfile(activeProfile.id);
            }
        } catch (error) {
            console.error('Photo upload error:', error);
            AlertService.alert('Error', 'Failed to upload photo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={Platform.OS === 'web' ? false : true}
        >
            <View style={styles.content}>
                {/* Header Section */}
                <View style={styles.promoHeader}>
                    <TouchableOpacity
                        onPress={handleUploadPhoto}
                        activeOpacity={0.7}
                        style={styles.parrotContainer}
                    >
                        {activeProfile?.avatarAsset && !activeProfile.avatarAsset.includes('.png') && !activeProfile.avatarAsset.includes('.jpg') && activeProfile.avatarAsset.length > 50 ? (
                            // It's a base64/custom URI
                            <Image
                                source={{ uri: activeProfile.avatarAsset }}
                                style={styles.parrotImage}
                            />
                        ) : activeProfile?.avatarAsset ? (
                            // It's a filename from imageMap
                            <Image
                                source={getSpeciesImage(activeProfile.avatarAsset)}
                                style={styles.parrotImage}
                            />
                        ) : (
                            <View style={styles.parrotPlaceholder}>
                                <Text style={{ fontSize: 40 }}>🦜</Text>
                            </View>
                        )}
                        <View style={styles.plusOverlay}>
                            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>+</Text>
                        </View>
                    </TouchableOpacity>

                    <Text style={[theme.typography.h1, { color: theme.colors.text, textAlign: 'center', marginTop: 16 }]}>
                        BeakBuddy <Text style={{ color: theme.colors.brand.primary }}>Pro</Text>
                    </Text>
                    <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8 }]}>
                        The ultimate diagnostic tool for your feathered friends
                    </Text>
                </View>

                {/* Feature List */}
                <View style={styles.featuresSection}>
                    <Feature
                        icon="🧪"
                        title="Advanced AI Scanner"
                        desc="Unlimited, instant food safety analysis with 99% accuracy."
                        theme={theme}
                    />
                    <Feature
                        icon="🧑‍⚕️"
                        title="Health Assistance"
                        desc="24/7 access to our expert AI avian care assistant."
                        theme={theme}
                    />
                    <Feature
                        icon="📈"
                        title="Personalized Plans"
                        desc="Tailored diet and training schedules for your specific species."
                        theme={theme}
                    />
                    <Feature
                        icon="📱"
                        title="Offline Mode"
                        desc="Access your safe-list and care data even without internet."
                        theme={theme}
                    />
                </View>

                {subscriptionStatus.isActive ? (
                    <LinearGradient
                        colors={[theme.colors.brand.safe + '40', theme.colors.brand.safe + '10']}
                        style={[styles.statusBanner, { borderColor: theme.colors.brand.safe }]}
                    >
                        <Text style={[theme.typography.h3, { color: theme.colors.brand.safe, textAlign: 'center' }]}>
                            ✅ Pro Membership Active
                        </Text>
                        <Text style={[theme.typography.bodySmall, { color: theme.colors.text, textAlign: 'center', marginTop: 8 }]}>
                            {subscriptionStatus.isInTrialPeriod ? "You are currently in your 14-day free trial." : "Thank you for being a Pro member!"}
                        </Text>
                        <Button
                            title="Manage Membership"
                            onPress={() => {
                                AlertService.alert('Manage Subscription', 'To manage your subscription, please visit your App Store or Play Store settings.');
                            }}
                            variant="secondary"
                            style={{ marginTop: 20, backgroundColor: 'rgba(255,255,255,0.5)' }}
                        />
                    </LinearGradient>
                ) : (
                    <View>
                        <LinearGradient
                            colors={[theme.colors.brand.primary, theme.colors.brand.brandPurple]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.ctaBanner}
                        >
                            <Text style={[theme.typography.h2, { color: '#FFFFFF', textAlign: 'center' }]}>
                                ✨ Go Pro
                            </Text>
                            <Text style={[theme.typography.body, { color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 4, marginBottom: 24 }]}>
                                Try all features free for 14 days!
                            </Text>

                            {!offerings ? (
                                <ActivityIndicator color="#FFF" style={{ margin: 20 }} />
                            ) : offerings.availablePackages?.length === 0 ? (
                                <View style={{ padding: 10 }}>
                                    <Text style={{ color: '#FFF', textAlign: 'center' }}>
                                        No subscription plans found.
                                    </Text>
                                    <Text style={{ color: '#FFF', textAlign: 'center', fontSize: 10, marginTop: 5, opacity: 0.8 }}>
                                        (Check RevenueCat Configuration)
                                    </Text>
                                    <Button
                                        title="Retry"
                                        onPress={loadOfferings}
                                        variant="secondary"
                                        style={{ marginTop: 10, backgroundColor: 'rgba(255,255,255,0.2)' }}
                                    />
                                </View>
                            ) : (
                                offerings.availablePackages.map((pkg: any) => (
                                    <TouchableOpacity
                                        key={pkg.identifier}
                                        style={[styles.premiumButton, { marginBottom: 12 }]}
                                        onPress={() => handlePurchase(pkg)}
                                        disabled={loading}
                                    >
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                            <View>
                                                <Text style={[theme.typography.button, { color: theme.colors.brand.primary, textAlign: 'left' }]}>
                                                    {pkg.product.title}
                                                </Text>
                                                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                                                    14-day free trial included
                                                </Text>
                                            </View>
                                            <Text style={[theme.typography.h3, { color: theme.colors.brand.primary }]}>
                                                {pkg.product.priceString}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </LinearGradient>

                        <TouchableOpacity
                            onPress={async () => {
                                try {
                                    setLoading(true);
                                    await SubscriptionService.restorePurchases();
                                    await checkStatus();
                                    AlertService.alert('Success', 'Subscription restored successfully!');
                                } catch (e) {
                                    AlertService.alert('Error', 'Failed to restore purchases.');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                            style={{ padding: 16, marginTop: 12 }}
                        >
                            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, textAlign: 'center', textDecorationLine: 'underline' }]}>
                                Restore Purchases
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 32, marginBottom: 40, paddingHorizontal: 40 }]}>
                    All subscriptions include a 14-day free trial. Cancel anytime in settings.
                </Text>
            </View>
        </ScrollView>
    );
};

const Feature: React.FC<{ icon: string; title: string; desc: string; theme: any }> = ({ icon, title, desc, theme }) => (
    <View style={[styles.featureCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <View style={styles.featureIconContainer}>
            <Text style={styles.featureIcon}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
            <Text style={[theme.typography.h3, { color: theme.colors.text, fontSize: 16 }]}>{title}</Text>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 2 }]}>{desc}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 20 },
    content: { padding: 16 },
    promoHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    parrotContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#8B5CF6',
        position: 'relative',
    },
    parrotImage: {
        width: 94,
        height: 94,
        borderRadius: 47,
    },
    parrotPlaceholder: {
        width: 94,
        height: 94,
        borderRadius: 47,
        justifyContent: 'center',
        alignItems: 'center',
    },
    plusOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    featuresSection: {
        marginBottom: 20,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
        borderWidth: 1,
    },
    featureIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    featureIcon: { fontSize: 18 },
    ctaBanner: {
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        overflow: 'hidden',
    },
    premiumButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statusBanner: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: 'center',
        marginTop: 8,
    }
});

export default SubscriptionScreen;
