// services/StorageService.ts

import { Platform } from 'react-native';

let storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    getItemSync?(key: string): string | null;
    setItemSync?(key: string, value: string): void;
};

if (Platform.OS === 'web') {
    storage = {
        async getItem(key: string) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                console.warn('StorageService getItem error (web)', e);
                return null;
            }
        },
        async setItem(key: string, value: string) {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                console.warn('StorageService setItem error (web)', e);
            }
        },
        // Synchronous helpers for legacy code
        getItemSync(key: string) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                console.warn('StorageService getItemSync error (web)', e);
                return null;
            }
        },
        setItemSync(key: string, value: string) {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                console.warn('StorageService setItemSync error (web)', e);
            }
        },
    };
} else {
    // Native platforms use AsyncStorage
    // Ensure @react-native-async-storage/async-storage is installed
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    storage = {
        async getItem(key: string) {
            try {
                return await AsyncStorage.getItem(key);
            } catch (e) {
                console.warn('StorageService getItem error (native)', e);
                return null;
            }
        },
        async setItem(key: string, value: string) {
            try {
                await AsyncStorage.setItem(key, value);
            } catch (e) {
                console.warn('StorageService setItem error (native)', e);
            }
        },
        // Native sync stubs (not used in web)
        getItemSync(key: string) {
            console.warn('StorageService getItemSync not supported on native');
            return null;
        },
        setItemSync(key: string, value: string) {
            console.warn('StorageService setItemSync not supported on native');
        },
    };
}


export const StorageService = {
    getItem: storage.getItem,
    setItem: storage.setItem,
    getItemSync: storage.getItemSync,
    setItemSync: storage.setItemSync,
};
