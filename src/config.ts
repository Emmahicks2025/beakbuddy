/**
 * Central Configuration for BeakBuddy App
 * All keys sourced from environment variables - no hardcoded disabled keys.
 */

export const Config = {
    // Gemini AI API Key
    GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || "",

    // Firebase API Key (beakbuddy-march2026)
    FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",

    // Google Sign-In Web Client ID
    GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "",

    // Google Sign-In iOS Client ID
    GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "",
};
