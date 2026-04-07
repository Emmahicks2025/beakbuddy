/**
 * Central Configuration for Parrot App
 * ensuring reliable access to API keys in production builds.
 */

export const Config = {
    // Dynamically sourced from Codemagic Environment Variables
    GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
    FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
};
