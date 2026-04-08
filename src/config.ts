/**
 * Central Configuration for BeakBuddy
 * Gemini API key is fetched live from Firebase Remote Config.
 * Update the key in Firebase Console — no app rebuild needed ever.
 */
import { getGeminiApiKey } from './services/remoteConfig';
import { ENV } from './env.generated';

export const Config = {
    /**
     * Returns the Gemini key from Remote Config (or hardcoded fallback).
     * initRemoteConfig() must be called at app startup for the live key.
     */
    get GEMINI_API_KEY() {
        return getGeminiApiKey();
    },
    FIREBASE_API_KEY: ENV.FIREBASE_API_KEY,
    GOOGLE_WEB_CLIENT_ID: ENV.GOOGLE_WEB_CLIENT_ID,
};
