import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { GlobalChatService } from '../../services/aiChat';
import { getSpeciesImage } from '../../utils/imageMap';
import { useTheme } from '../../theme/ThemeContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { ProfileSelectorModal } from '../../components/ProfileSelectorModal';
import { useProfileContext } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import { SpeciesRepository } from '../../database/repository';
import { Species } from '../../types';
import { AlertService } from '../../services/AlertService';

interface ProfileTabProps {
    onBackToStart: () => void;
    navigation: any;
}

const ProfileTab: React.FC<ProfileTabProps> = (props) => {
    const { onBackToStart, navigation } = props;
    const { theme, themeMode, setThemeMode } = useTheme();
    const { activeProfile, allProfiles, isLoading, switchProfile } = useProfileContext();
    const { deleteAccount } = useAuth();
    const [species, setSpecies] = useState<Species | null>(null);
    const [showProfileSelector, setShowProfileSelector] = useState(false);

    useEffect(() => {
        loadSpecies();
    }, [activeProfile]);

    const loadSpecies = async () => {
        if (activeProfile) {
            const s = await SpeciesRepository.getById(activeProfile.speciesId);
            setSpecies(s);
        }
    };

    const handleExport = () => {
        AlertService.alert(
            'Export Data',
            'Profile data would be exported as JSON. Feature demonstration.',
            [{ text: 'OK' }]
        );
    };

    const handleHelp = () => {
        // @ts-ignore
        props.navigation.navigate('Help');
    };

    return (
        <>
            <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.content}>
                    {isLoading ? (
                        <Card style={styles.centerCard}>
                            <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                                Loading profile...
                            </Text>
                        </Card>
                    ) : !activeProfile ? (
                        <Card style={styles.centerCard}>
                            <Text style={[theme.typography.body, { color: theme.colors.text, textAlign: 'center', marginBottom: 16 }]}>
                                No profile found or selected.
                            </Text>
                            <Button
                                title="Create New Profile"
                                onPress={() => navigation.navigate('SelectSpecies')}
                                style={{ minWidth: 200 }}
                            />
                        </Card>
                    ) : (
                        <>
                            {/* Profile Count Indicator */}
                            {allProfiles.length > 1 && (
                                <View style={[styles.profileCountBadge, { backgroundColor: theme.colors.brand.primary }]}>
                                    <Text style={[theme.typography.caption, { color: '#FFF', fontWeight: '700' }]}>
                                        {allProfiles.length} Parrots
                                    </Text>
                                </View>
                            )}

                            {/* Profile Card - Tap to open selector */}
                            <TouchableOpacity
                                onPress={() => setShowProfileSelector(true)}
                                activeOpacity={0.8}
                            >
                                <Card style={styles.profileCard}>
                                    <Image
                                        source={getSpeciesImage(activeProfile.avatarAsset)}
                                        style={styles.avatar}
                                        resizeMode="cover"
                                    />
                                    <Text style={[theme.typography.h1, { color: theme.colors.text, textAlign: 'center', marginTop: 16 }]}>
                                        {activeProfile.displayName}
                                    </Text>
                                    <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                                        {species?.commonName || 'Unknown Species'}
                                    </Text>
                                    <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, textAlign: 'center', fontStyle: 'italic' }]}>
                                        {species?.scientificName || ''}
                                    </Text>

                                    {/* Tap to switch hint */}
                                    <View style={styles.tapHint}>
                                        <Text style={[theme.typography.caption, { color: theme.colors.brand.primary }]}>
                                            Tap to switch profiles
                                        </Text>
                                    </View>
                                </Card>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Common Settings Section (Always Visible) */}
                    <Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 24, marginBottom: 12 }]}>
                        Theme
                    </Text>

                    <View style={styles.themeOptions}>
                        <Chip
                            label="Light"
                            active={themeMode === 'light'}
                            onPress={() => setThemeMode('light')}
                            style={{ marginRight: 8 }}
                        />
                        <Chip
                            label="Dark"
                            active={themeMode === 'dark'}
                            onPress={() => setThemeMode('dark')}
                            style={{ marginRight: 8 }}
                        />
                        <Chip
                            label="System"
                            active={themeMode === 'system'}
                            onPress={() => setThemeMode('system')}
                        />
                    </View>

                    <Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 24, marginBottom: 12 }]}>
                        Settings
                    </Text>

                    <Button
                        title="⭐ Manage Subscription"
                        onPress={() => props.navigation.navigate('Subscription')}
                        variant="secondary"
                        style={{ marginBottom: 12 }}
                    />

                    <Button
                        title="Switch Profile"
                        onPress={() => setShowProfileSelector(true)}
                        variant="secondary"
                        style={{ marginBottom: 12 }}
                    />

                    <Button
                        title="Export Profile Data"
                        onPress={handleExport}
                        variant="secondary"
                        style={{ marginBottom: 12 }}
                    />

                    <Button
                        title="Help & Support"
                        onPress={handleHelp}
                        variant="secondary"
                        style={{ marginBottom: 12 }}
                    />

                    <Button
                        title="Bring Back AI Helper 🦜"
                        onPress={() => {
                            GlobalChatService.restore();
                            Alert.alert("Success", "The AI helper bird has been restored!");
                        }}
                        variant="secondary"
                        style={{ marginBottom: 12, borderColor: theme.colors.brand.primary, borderWidth: 1 }}
                    />

                    <Button
                        title="Legal & Privacy"
                        onPress={() => props.navigation.navigate('Legal')}
                        variant="secondary"
                        style={{ marginBottom: 12 }}
                    />

                    <Button
                        title="🗑️ Delete Account"
                        onPress={() => {
                            Alert.alert(
                                "Delete Account",
                                "⚠️ WARNING: This will permanently delete your account and all associated data including:\n\n• All parrot profiles\n• Training history\n• Diet plans\n• Care tasks\n\nThis action cannot be undone. Are you absolutely sure?",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                        text: "Delete Forever",
                                        onPress: async () => {
                                            try {
                                                await deleteAccount();
                                                Alert.alert("Account Deleted", "Your account has been permanently deleted.");
                                                onBackToStart();
                                            } catch (error) {
                                                Alert.alert("Error", "Failed to delete account. Please try again.");
                                            }
                                        },
                                        style: "destructive"
                                    }
                                ]
                            );
                        }}
                        variant="secondary"
                        style={{ marginBottom: 12, backgroundColor: '#FF3B30', borderColor: '#FF3B30' }}
                    />

                    <Button
                        title="🚪 Log Out"
                        onPress={() => {
                            Alert.alert(
                                "Log Out",
                                "Are you sure you want to log out? Your profiles will still be here when you return.",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    { text: "Log Out", onPress: onBackToStart, style: "destructive" }
                                ]
                            );
                        }}
                        variant="secondary"
                        style={{ marginBottom: 12, opacity: 0.6 }}
                    />

                    <Card style={styles.infoCard}>
                        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                            BeakBuddy v1.1.0-69
                        </Text>
                    </Card>
                </View>
            </ScrollView>

            {/* Profile Selector Modal */}
            <ProfileSelectorModal
                visible={showProfileSelector}
                onClose={() => setShowProfileSelector(false)}
                onAddProfile={() => navigation.navigate('SelectSpecies')}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    centerCard: {
        margin: 24,
        padding: 24,
        alignItems: 'center',
    },
    profileCountBadge: {
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 12,
    },
    profileCard: {
        padding: 24,
        alignItems: 'center',
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    tapHint: {
        marginTop: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
    },
    themeOptions: {
        flexDirection: 'row',
    },
    infoCard: {
        marginTop: 24,
        padding: 16,
    },
});

export default ProfileTab;
