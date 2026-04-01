import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getSpeciesImage, isSpeciesImageAvailable } from '../../utils/imageMap';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ProfileRepository } from '../../database/repository';
import { Species } from '../../types';
import { useProfileContext } from '../../context/ProfileContext';
import { ImageStorageService } from '../../services/ImageStorageService';

const CreateProfileScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
    const { theme } = useTheme();
    const { species } = route.params as { species: Species };
    const [name, setName] = useState('');

    const getUniqueOptions = () => {
        // If the species has a specific image available that is NOT the generic one, 
        // use only that to avoid species mismatch (e.g. showing a Conure for an African Grey).
        if (species.imageAsset && species.imageAsset !== 'generic.png' && isSpeciesImageAvailable(species.imageAsset)) {
            return [species.imageAsset];
        }
        // Otherwise, use the generic fallback.
        return ['generic.png'];
    };

    const avatarOptions = getUniqueOptions();
    const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);
    const [customImage, setCustomImage] = useState<string | null>(null);

    // ...

    const handleUploadPhoto = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
                base64: false, // CRITICAL: Disable base64 to avoid OOM
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                // Store the temp URI locally first for preview
                setCustomImage(asset.uri);
                setSelectedAvatar(asset.uri);
            }
        } catch (error) {
            console.error('Photo upload error:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const { addProfile } = useProfileContext();

    const handleCreate = async () => {
        if (!name.trim()) {
            alert('Please enter a name for your parrot');
            return;
        }

        try {
            let finalAvatar = selectedAvatar;

            // If it's a custom uploaded image (not a bundled asset)
            // Save it to permanent storage if it's a temporary file URI
            const isBundledAsset = selectedAvatar && (
                selectedAvatar.endsWith('.png') ||
                selectedAvatar.endsWith('.jpg') ||
                selectedAvatar.endsWith('.jpeg') ||
                selectedAvatar === 'generic.png'
            );
            const isRemoteUrl = selectedAvatar && selectedAvatar.startsWith('http');

            if (selectedAvatar && !isBundledAsset && !isRemoteUrl) {
                console.log("Saving image to permanent storage...");
                finalAvatar = await ImageStorageService.saveImage(selectedAvatar);
                console.log("Image saved to:", finalAvatar);
            }

            await addProfile({
                displayName: name.trim(),
                speciesId: species.id,
                avatarAsset: finalAvatar,
            });

            navigation.navigate('OwnerTabs');
        } catch (error) {
            console.error('Failed to create profile:', error);
            alert('Failed to create profile. Please try again.');
        }
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.content}
        >
            <Card style={styles.speciesCard}>
                <TouchableOpacity onPress={handleUploadPhoto} activeOpacity={0.8} style={styles.imageContainer}>
                    <Image
                        source={getSpeciesImage(customImage || selectedAvatar)}
                        style={styles.speciesImage}
                        resizeMode="cover"
                    />
                    <View style={styles.uploadBadge}>
                        <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700' }}>UPLOAD</Text>
                    </View>
                </TouchableOpacity>
                <Text style={[theme.typography.h2, { color: theme.colors.text, textAlign: 'center', marginTop: 12 }]}>
                    {species.commonName}
                </Text>
                <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, textAlign: 'center', fontStyle: 'italic' }]}>
                    {species.scientificName}
                </Text>
            </Card>

            <Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 24, marginBottom: 8 }]}>
                Name Your Parrot
            </Text>

            <TextInput
                style={[
                    styles.input,
                    theme.typography.body,
                    {
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                        borderRadius: theme.borderRadius.md,
                    }
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Enter name..."
                placeholderTextColor={theme.colors.textSecondary}
            />

            {avatarOptions.length > 1 && (
                <>
                    <Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 24, marginBottom: 12 }]}>
                        Choose Avatar
                    </Text>

                    <View style={styles.avatarGrid}>
                        {avatarOptions.map((avatar) => (
                            <TouchableOpacity
                                key={avatar}
                                onPress={() => setSelectedAvatar(avatar)}
                                style={[
                                    styles.avatarOption,
                                    selectedAvatar === avatar && {
                                        borderColor: theme.colors.brand.primary,
                                        borderWidth: 3,
                                    }
                                ]}
                            >
                                <Image
                                    source={getSpeciesImage(avatar)}
                                    style={styles.avatarImage}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            <Button
                title="Create Profile"
                onPress={handleCreate}
                style={{ marginTop: 32 }}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
    },
    speciesCard: {
        alignItems: 'center',
        padding: 24,
    },
    speciesImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    imageContainer: {
        position: 'relative',
    },
    uploadBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    input: {
        borderWidth: 1,
        padding: 16,
        minHeight: 48,
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    avatarOption: {
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'transparent',
        overflow: 'hidden',
    },
    avatarImage: {
        width: 80,
        height: 80,
    },
});

export default CreateProfileScreen;
