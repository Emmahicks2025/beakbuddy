/**
 * API Key Provider
 * The Gemini key is injected by Codemagic at build time into env.generated.ts.
 * This file is gitignored — the key never touches the GitHub repo.
 * To update the key: update GEMINI_API_KEY in Codemagic env vars → new build.
 */
import { ENV } from '../env.generated';

let _geminiKey: string = ENV.GEMINI_API_KEY || '';

export function initRemoteConfig(): Promise<void> {
    // No-op — key is already baked in from env.generated.ts at build time
    return Promise.resolve();
}

export function getGeminiApiKey(): string {
    return _geminiKey;
}
