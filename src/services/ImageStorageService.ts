import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export const ImageStorageService = {
    /**
     * Saves an image from a temporary URI to the app's permanent document storage.
     * Returns the new permanent URI.
     */
    saveImage: async (tempUri: string): Promise<string> => {
        if (Platform.OS === 'web') {
            // On web, we can't save to filesystem like this. 
            // Just return the original URI (which is likely a blob URL or base64).
            return tempUri;
        }

        try {
            const fileName = `profile_${Date.now()}.jpg`;
            const directory = `${FileSystem.documentDirectory}avatars/`;
            const destPath = `${directory}${fileName}`;

            // Ensure directory exists
            const dirInfo = await FileSystem.getInfoAsync(directory);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
            }

            // Copy file to permanent storage
            await FileSystem.copyAsync({
                from: tempUri,
                to: destPath
            });

            return destPath;
        } catch (error) {
            console.error('ImageStorageService: Failed to save image', error);
            // Fallback: return the temp URI, though it might expire
            return tempUri;
        }
    },

    /**
     * Deletes an image from storage.
     */
    deleteImage: async (uri: string): Promise<void> => {
        if (Platform.OS === 'web') return;

        try {
            if (uri.startsWith(FileSystem.documentDirectory!)) {
                await FileSystem.deleteAsync(uri, { idempotent: true });
            }
        } catch (error) {
            console.error('ImageStorageService: Failed to delete image', error);
        }
    }
};
