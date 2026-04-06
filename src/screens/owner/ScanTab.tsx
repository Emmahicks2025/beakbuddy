import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, ScrollView, TextInput, Platform } from 'react-native';
import { Camera, CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FoodRepository, UserMarkedFoodRepository, SpeciesRepository } from '../../database/repository';
import { FoodItem } from '../../types';
import { FoodVerdictBadge } from '../../components/FoodVerdictBadge';
import { VisualAnalysisResult, analyzeFoodImage, analyzeFoodText } from '../../services/aiVision';
import { useProfileContext } from '../../context/ProfileContext';
import { AlertService } from '../../services/AlertService';
import SubscriptionService from '../../services/subscriptionService';
import { MedicalDisclaimerLine } from '../../components/MedicalDisclaimerLine';

const ScanTab: React.FC = () => {
    const { theme } = useTheme();
    const navigation = useNavigation<any>();
    const { activeProfile } = useProfileContext();
    const [permission, requestPermission] = useCameraPermissions();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [visionResult, setVisionResult] = useState<VisualAnalysisResult | null>(null);
    const [facing, setFacing] = useState<'back' | 'front'>('back');
    const cameraRef = React.useRef<CameraView>(null);

    useEffect(() => {
        if (permission) {
            setHasPermission(permission.status === 'granted');
        }
    }, [permission]);

    const handleRequestPermission = async () => {
        try {
            console.log("Camera: Requesting permission...");
            const result = await requestPermission();
            console.log("Camera: Permission result:", result.status);
            setHasPermission(result.status === 'granted');

            if (result.status === 'denied') {
                if (Platform.OS === 'web') {
                    AlertService.alert('Permission Denied', 'Camera access was blocked. Please click the Lock icon in your browser address bar and set Camera to "Allow", then REFRESH the page.');
                } else {
                    AlertService.alert('Permission Denied', 'Please enable camera access in your phone settings.');
                }
            }
        } catch (error: any) {
            console.error("Camera permission error:", error);
            AlertService.alert('Error', `Permission Request Failed: ${error.message}`);
            setHasPermission(false);
        }
    };


    const handleCapture = async () => {
        console.log("Camera: Capture requested. Ref:", !!cameraRef.current, "Analyzing:", isAnalyzing);
        if (cameraRef.current && !isAnalyzing) {
            try {
                setIsAnalyzing(true);
                const photo = await cameraRef.current.takePictureAsync({
                    base64: true,
                    quality: 0.1,
                });

                if (photo?.base64) {
                    setShowCamera(false);

                    // Get species for context
                    let speciesName = 'Parrot';
                    if (activeProfile?.speciesId) {
                        const s = await SpeciesRepository.getById(activeProfile.speciesId);
                        if (s) speciesName = s.commonName;
                    }

                    const result = await analyzeFoodImage(photo.base64, speciesName);
                    setVisionResult(result);
                }
            } catch (error) {
                console.error("Capture failed", error);
                AlertService.alert('Error', 'Failed to analyze image. Please try again.');
                setShowCamera(false);
            } finally {
                setIsAnalyzing(false);
            }
        }
    };

    const handleImagePicker = async () => {
        try {
            console.log("Picker: Launching...");
            setIsAnalyzing(true); // Show spinner while picker is open to prevent double clicks

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.1,
                base64: true,
            });

            if (result.canceled) {
                console.log("Picker: Canceled");
                setIsAnalyzing(false);
                return;
            }

            if (result.assets && result.assets[0].base64) {
                console.log("Picker: Image selected, length:", result.assets[0].base64.length);
                setShowCamera(false);

                let speciesName = 'Parrot';
                if (activeProfile?.speciesId) {
                    const s = await SpeciesRepository.getById(activeProfile.speciesId);
                    if (s) speciesName = s.commonName;
                }

                console.log("Picker: Sending to AI for", speciesName);
                const res = await analyzeFoodImage(result.assets[0].base64, speciesName);
                setVisionResult(res);
            } else {
                console.warn("Picker: No base64 data found");
                AlertService.alert('Error', 'Could not read image data.');
            }
        } catch (error: any) {
            console.error("Image picker error", error);
            AlertService.alert('Error', `Picker Failed: ${error.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddToSafeList = async () => {
        if (!activeProfile || !visionResult) return;

        try {
            // Try to find existing food ID, or generate one
            const existing = await FoodRepository.search(visionResult.foodName);
            const foodId = existing.length > 0 ? existing[0].id : `ai_${Date.now()}`;

            await UserMarkedFoodRepository.create({
                profileId: activeProfile.id,
                foodId: foodId,
                userVerdict: visionResult.verdict,
                userNote: `AI Scan: ${visionResult.description}`,
            });

            AlertService.alert('Saved', `${visionResult.foodName} added to your safe list!`);
        } catch (error) {
            console.error('Save failed', error);
            AlertService.alert('Error', 'Could not save to list.');
        }
    };

    if (hasPermission === null) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Card style={styles.centerCard}>
                    <Text style={[theme.typography.h2, { color: theme.colors.text, textAlign: 'center', marginBottom: 16 }]}>
                        📷 Camera Access
                    </Text>
                    <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 24 }]}>
                        We need your permission to use the camera for scanning food items.
                    </Text>
                    <Button
                        title="Enable Live Camera"
                        onPress={handleRequestPermission}
                        style={{ width: '100%', marginBottom: 12 }}
                    />
                    <Button
                        title="Take Photo or Upload"
                        onPress={handleImagePicker}
                        variant="secondary"
                        style={{ width: '100%' }}
                    />
                </Card>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Card style={styles.centerCard}>
                    <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 12 }]}>
                        Camera Permission Required
                    </Text>
                    <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: 16 }]}>
                        Please enable camera access in settings to use the scan feature.
                    </Text>
                    <Button
                        title="Try Again"
                        onPress={() => setHasPermission(null)}
                        variant="secondary"
                        style={{ marginBottom: 12, width: '100%' }}
                    />
                    <Button
                        title="Take Photo or Upload"
                        onPress={handleImagePicker}
                        style={{ width: '100%' }}
                    />
                </Card>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {showCamera ? (
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing={facing}
                >
                    <View style={styles.cameraOverlay}>
                        <View style={styles.topControls}>
                            <TouchableOpacity onPress={() => setShowCamera(false)} style={styles.iconButton}>
                                <Text style={{ color: '#FFF', fontSize: 18 }}>✕</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))} style={styles.iconButton}>
                                <Text style={{ color: '#FFF', fontSize: 18 }}>🔄</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={[theme.typography.h3, { color: '#FFFFFF', textAlign: 'center', marginTop: 20 }]}>
                            {isAnalyzing ? "Analyzing..." : "Take a Photo"}
                        </Text>

                        <View style={styles.cameraControls}>
                            <TouchableOpacity style={styles.captureButton} onPress={handleCapture} disabled={isAnalyzing}>
                                <View style={styles.captureInner} />
                            </TouchableOpacity>

                            <Button
                                title="Cancel"
                                onPress={() => setShowCamera(false)}
                                variant="secondary"
                                style={{ marginTop: 20 }}
                            />
                        </View>
                    </View>
                </CameraView>
            ) : (
                <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                    {isAnalyzing && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color={theme.colors.brand.primary} />
                            <Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 16 }]}>
                                Analyzing...
                            </Text>
                            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 8 }]}>
                                Checking food safety for your {activeProfile?.displayName || 'parrot'}
                            </Text>
                        </View>
                    )}

                    <Card style={styles.scanCard}>
                        <Text style={[theme.typography.h2, { color: theme.colors.text, textAlign: 'center', marginBottom: 16 }]}>
                            📷 AI Food Scanner
                        </Text>
                        <Text style={[theme.typography.body, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 24 }]}>
                            Take a picture of any food item to instantly check if it's safe for your {activeProfile?.displayName || 'parrot'}.
                        </Text>
                        <Button
                            title="Live Camera"
                            onPress={async () => {
                                setVisionResult(null);
                                setShowCamera(true);
                            }}
                            style={{ marginBottom: 12 }}
                        />
                        <Button
                            title="Take Photo or Upload"
                            onPress={handleImagePicker}
                            variant="secondary"
                            style={{ marginBottom: 16 }}
                        />
                    </Card>

                    {visionResult && (
                        <Card style={styles.resultCard}>
                            <View style={styles.resultHeader}>
                                <Text style={[theme.typography.h3, { color: theme.colors.text, flex: 1 }]}>
                                    {visionResult.foodName}
                                </Text>
                                <FoodVerdictBadge verdict={visionResult.verdict} confidence={visionResult.confidence} />
                            </View>

                            <Text style={[theme.typography.body, { color: theme.colors.text, marginTop: 12 }]}>
                                {visionResult.description}
                            </Text>

                            <View style={[styles.infoBox, { backgroundColor: theme.colors.surface }]}>
                                <Text style={[theme.typography.bodySmall, { color: theme.colors.text, fontStyle: 'italic' }]}>
                                    🤖 AI Reasoning: {visionResult.reasoning}
                                </Text>
                            </View>

                            {visionResult.servingTips ? (
                                <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 12 }]}>
                                    💡 Tip: {visionResult.servingTips}
                                </Text>
                            ) : null}

                            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 16, textAlign: 'center', fontStyle: 'italic' }]}>
                                ⚠️ AI analysis is for educational purposes only and may be inaccurate. Consult a vet for safety.
                            </Text>

                            <MedicalDisclaimerLine style={{ marginTop: 16 }} />

                            {activeProfile && visionResult.verdict !== 'TOXIC' && (
                                <Button
                                    title="Add to Safe List"
                                    onPress={handleAddToSafeList}
                                    variant="secondary"
                                    style={{ marginTop: 16 }}
                                />
                            )}
                        </Card>
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0)',
        justifyContent: 'space-between',
        padding: 24,
    },
    topControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraMessage: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraControls: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 20,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#FFF',
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF',
    },
    centerCard: {
        margin: 24,
        padding: 24,
        alignItems: 'center',
    },
    scanCard: {
        padding: 24,
        marginBottom: 16,
    },
    manualCard: {
        padding: 16,
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        padding: 16,
        minHeight: 48,
        marginBottom: 8,
    },
    resultCard: {
        padding: 16,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    infoBox: {
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
    },
    warningBox: {
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 100,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    }
});

export default ScanTab;
