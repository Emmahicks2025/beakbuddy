/**
 * Firebase Remote Config Service
 * Fetches live configuration values (like API keys) from Firebase.
 * Update keys in Firebase Console → no app rebuild needed.
 */
import remoteConfig from '@react-native-firebase/remote-config';
import { ENV } from './env.generated';

// Fallback values used if Remote Config fetch fails (e.g. no internet on first launch)
const DEFAULTS = {
    gemini_api_key: ENV.GEMINI_API_KEY || '',
};

let _initialized = false;
let _geminiKey: string = DEFAULTS.gemini_api_key;

/**
 * Call this once at app startup (before any AI features are used).
 * Fetches latest keys from Firebase Remote Config.
 */
export async function initRemoteConfig(): Promise<void> {
    if (_initialized) return;

    try {
        await remoteConfig().setDefaults(DEFAULTS);

        // Cache expiry: 1 hour in production, 0 in dev for instant updates
        await remoteConfig().setConfigSettings({
            minimumFetchIntervalMillis: __DEV__ ? 0 : 3600000,
        });

        await remoteConfig().fetchAndActivate();

        const fetchedKey = remoteConfig().getValue('gemini_api_key').asString();
        if (fetchedKey && fetchedKey.length > 10) {
            _geminiKey = fetchedKey;
            console.log('[RemoteConfig] Gemini key loaded from Firebase. Starts with:', fetchedKey.slice(0, 8));
        } else {
            console.warn('[RemoteConfig] Key from Firebase was empty, using fallback.');
        }

        _initialized = true;
    } catch (error) {
        console.warn('[RemoteConfig] Fetch failed, using fallback key:', error);
        _initialized = true; // Don't retry repeatedly
    }
}

/**
 * Returns the current Gemini API key.
 * Always call initRemoteConfig() at app launch before using this.
 */
export function getGeminiApiKey(): string {
    return _geminiKey;
}
