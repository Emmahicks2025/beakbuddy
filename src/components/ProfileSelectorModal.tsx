import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, Alert, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Button } from './Button';
import { useProfileContext } from '../context/ProfileContext';
import { getSpeciesImage } from '../utils/imageMap';
import { AlertService } from '../services/AlertService';
import { ParrotProfile } from '../types';

interface ProfileSelectorModalProps {
    visible: boolean;
    onClose: () => void;
    onAddProfile: () => void;
}

export const ProfileSelectorModal: React.FC<ProfileSelectorModalProps> = ({
    visible,
    onClose,
    onAddProfile,
}) => {
    const { theme } = useTheme();
    const { activeProfile, allProfiles, switchProfile, deleteProfile } = useProfileContext();

    // Debug log to trace what the modal sees
    useEffect(() => {
        if (visible) {
            console.log('ProfileSelectorModal: Visible, allProfiles count:', allProfiles.length);
        }
    }, [visible, allProfiles.length]);

    const handleSelectProfile = async (profileId: string) => {
        console.log('ProfileSelectorModal: Selecting profile:', profileId);
        await switchProfile(profileId);
        onClose();
    };

    const handleDeleteProfile = (profileId: string, profileName: string) => {
        if (allProfiles.length === 1) {
            AlertService.alert(
                'Cannot Delete',
                'You must have at least one profile. Create a new profile before deleting this one.'
            );
            return;
        }

        AlertService.confirm(
            'Delete Profile',
            `Are you sure you want to delete "${profileName}"?`,
            async () => {
                await deleteProfile(profileId);
            }
        );
    };

    const renderProfileItem = ({ item: profile }: { item: ParrotProfile }) => {
        const isActive = profile.id === activeProfile?.id;
        return (
            <TouchableOpacity
                key={profile.id}
                onPress={() => handleSelectProfile(profile.id)}
                activeOpacity={0.7}
                style={[
                    styles.profileCard,
                    {
                        backgroundColor: theme.isDark ? '#1F2937' : '#FFFFFF',
                        borderColor: isActive ? theme.colors.brand.primary : theme.colors.border,
                        borderWidth: isActive ? 2 : 1
                    }
                ]}
            >
                <View style={styles.profileCardContent}>
                    <Image
                        source={getSpeciesImage(profile.avatarAsset)}
                        style={styles.avatar}
                        resizeMode="cover"
                    />

                    <View style={styles.profileInfo}>
                        <Text style={[theme.typography.h3, { color: theme.colors.text }]} numberOfLines={1}>
                            {profile.displayName}
                        </Text>
                        <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                            {profile.speciesId?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </Text>
                    </View>

                    <View style={styles.actionsContainer}>
                        {isActive ? (
                            <View style={[styles.activeBadge, { backgroundColor: theme.colors.brand.primary + '20' }]}>
                                <Text style={{ fontSize: 18 }}>✅</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={() => handleDeleteProfile(profile.id, profile.displayName)}
                                style={[styles.deleteButton, { backgroundColor: theme.colors.background }]}
                            >
                                <Text style={{ fontSize: 18 }}>🗑️</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[
                    styles.modalContent,
                    { backgroundColor: theme.isDark ? '#111827' : '#FFFFFF' }
                ]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[theme.typography.h2, { color: theme.colors.text }]}>
                            My Parrots
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={{ fontSize: 24, color: theme.colors.text }}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Profile List */}
                    <View style={{ flexShrink: 1, marginBottom: 8 }}>
                        {allProfiles.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
                                    No parrots found.
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={allProfiles}
                                renderItem={renderProfileItem}
                                keyExtractor={item => item.id}
                                showsVerticalScrollIndicator={false}
                                style={{ flexGrow: 0 }}
                                contentContainerStyle={{ paddingBottom: 10 }}
                            />
                        )}
                    </View>

                    {/* Footer / Add Button */}
                    <View style={{ paddingTop: 8 }}>
                        <Button
                            title="+ Add New Parrot"
                            onPress={() => {
                                onClose();
                                onAddProfile();
                            }}
                            style={styles.addButton}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        paddingTop: 24,
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileCard: {
        marginBottom: 12,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    profileCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    profileInfo: {
        flex: 1,
        marginRight: 8,
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    activeBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButton: {
        marginTop: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
});
