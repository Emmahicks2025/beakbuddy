/**
 * Central Configuration for BeakBuddy
 * Keys are physically written into env.generated.ts by Codemagic at build time.
 * A stub file exists locally so the import never fails during development.
 */
import { ENV } from './env.generated';

export const Config = {
    GEMINI_API_KEY: ENV.GEMINI_API_KEY,
    FIREBASE_API_KEY: ENV.FIREBASE_API_KEY,
    GOOGLE_WEB_CLIENT_ID: ENV.GOOGLE_WEB_CLIENT_ID,
};
