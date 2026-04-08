import { FoodVerdict } from '../types';
import SubscriptionService from './subscriptionService';
import { Config } from '../config';

export interface VisualAnalysisResult {
    foodName: string;
    verdict: FoodVerdict;
    confidence: number;
    description: string;
    reasoning: string;
    servingTips: string;
}

/**
 * Analyze an image of food using Google Gemini Vision
 */
export async function analyzeFoodImage(
    base64Image: string,
    parrotSpecies: string
): Promise<VisualAnalysisResult> {
    try {
        // Gating Check
        const isPro = await SubscriptionService.hasActiveSubscription();

        // Use Config for reliable key access
        const keys = [
            Config.GEMINI_API_KEY,
            Config.FIREBASE_API_KEY
        ].filter(k => !!k && k !== "MISSING");

        if (keys.length === 0) {
            throw new Error("Missing API Key");
        }

        // Resilient handling of base64 strings
        const parts = base64Image.split(',');
        const actualData = parts.length > 1 ? parts[1] : parts[0];
        let detectedMimeType = "image/jpeg";
        if (parts.length > 1) {
            const matches = parts[0].match(/:(.*?);/);
            if (matches && matches.length > 1) detectedMimeType = matches[1];
        }

        const prompt = `
        Analyze this image and identify the food item.
        Then, evaluating specifically for a ${parrotSpecies} parrot, determine if it is safe to eat.

        Return a JSON object with this EXACT structure:
        {
            "foodName": "Name of food",
            "verdict": "SAFE" | "TOXIC" | "CAUTION" | "UNKNOWN",
            "confidence": 0.0 to 1.0,
            "description": "Short description of what you see",
            "reasoning": "Why is it safe/toxic for this specific parrot species? (Max 2 sentences)",
            "servingTips": "How to serve it safely (e.g. 'Remove seeds', 'Cooked only') or 'DO NOT FEED' if toxic."
        }
        `;

        const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
        let lastError = "";

        for (const apiKey of keys) {
            for (const modelName of models) {
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                parts: [
                                    { text: prompt },
                                    { inline_data: { mime_type: detectedMimeType, data: actualData } }
                                ]
                            }],
                            generationConfig: { temperature: 0.4, maxOutputTokens: 1024 }
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (aiText) {
                            const jsonMatch = aiText.match(/\{[\s\S]*\}/);
                            if (jsonMatch) {
                                const result = JSON.parse(jsonMatch[0]);
                                return {
                                    foodName: result.foodName || "Unknown Item",
                                    verdict: (['SAFE', 'TOXIC', 'CAUTION'].includes(result.verdict) ? result.verdict : 'UNKNOWN') as FoodVerdict,
                                    confidence: result.confidence || 0.5,
                                    description: result.description || "",
                                    reasoning: result.reasoning || "Could not determine safety.",
                                    servingTips: result.servingTips || ""
                                };
                            }
                        }
                    } else {
                        const err = await response.json().catch(() => ({}));
                        lastError = `[${modelName}] ${response.status}: ${err.error?.message || 'Unknown'}`;
                    }
                } catch (e: any) {
                    lastError = `[${modelName}] ${e.message}`;
                }
            }
        }

        throw new Error(lastError || "AI Analysis Failed");

    } catch (error: any) {
        console.error('Vision Analysis Error Details:', error);

        // Construct a helpful user-facing error message
        let userReasoning = "Error connecting to AI service.";
        const errorMessage = error?.message || 'Unknown error';

        if (errorMessage.includes('Network request failed') || errorMessage.includes('fetch')) {
            userReasoning = "Network Error: Please check your internet connection.";
        } else if (errorMessage.includes('404') || errorMessage.includes('Model not found')) {
            userReasoning = "System Error: AI Model unavailable. Please update the app.";
        } else if (errorMessage.includes('400')) {
            userReasoning = "Image Error: The photo might be too large or format unsupported.";
        } else if (errorMessage.includes('403') || errorMessage.includes('key')) {
            userReasoning = "Configuration Error: Invalid API Key.";
        } else if (errorMessage.includes('429')) {
            userReasoning = "Traffic High: Please try again in a minute.";
        } else {
            userReasoning = `Server Error: ${errorMessage.slice(0, 50)}...`;
        }

        // Return detailed error for debugging
        return {
            foodName: "Analysis Failed",
            verdict: 'UNKNOWN',
            confidence: 0,
            description: "Could not analyze image.",
            reasoning: userReasoning,
            servingTips: "Please try searching by name instead."
        };
    }
}

/**
 * Analyze a food name using Google Gemini (Text only)
 */
export async function analyzeFoodText(
    foodName: string,
    parrotSpecies: string
): Promise<VisualAnalysisResult> {
    try {
        // Gating Check
        const isPro = await SubscriptionService.hasActiveSubscription();
        // UNGATED: Food scanner is now free for all users
        /*
        if (!isPro) {
            return {
                foodName: "Pro Feature Locked",
                verdict: 'UNKNOWN',
                confidence: 0,
                description: "Upgrade to BeakBuddy Pro to unlock AI Food Analysis.",
                reasoning: "This feature uses advanced AI to ensure parrot safety.",
                servingTips: "Tap 'Pro Features' to upgrade."
            };
        }
        */

        const apiKey = Config.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error("Missing API Key");
        }

        const prompt = `
        Analyze the food item "${foodName}".
        Evaluate specifically for a ${parrotSpecies} parrot. determine if it is safe to eat.

        Return a JSON object with this EXACT structure:
        {
            "foodName": "${foodName}",
            "verdict": "SAFE" | "TOXIC" | "CAUTION" | "UNKNOWN",
            "confidence": 0.0 to 1.0,
            "description": "Short description of the food",
            "reasoning": "Why is it safe/toxic for this specific parrot species? (Max 2 sentences)",
            "servingTips": "How to serve it safely (e.g. 'Remove seeds', 'Cooked only') or 'DO NOT FEED' if toxic."
        }
        `;

        // Using gemini-1.5-flash for text analysis (v1 endpoint)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            console.error('Gemini Text API Error:', response.status);
            throw new Error('Failed to analyze text');
        }

        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiText) throw new Error('No analysis received');

        // Extract JSON
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Invalid AI response format');

        const result = JSON.parse(jsonMatch[0]);

        return {
            foodName: result.foodName || foodName,
            verdict: (['SAFE', 'TOXIC', 'CAUTION'].includes(result.verdict) ? result.verdict : 'UNKNOWN') as FoodVerdict,
            confidence: result.confidence || 0.5,
            description: result.description || "",
            reasoning: result.reasoning || "Could not determine safety.",
            servingTips: result.servingTips || ""
        };

    } catch (error) {
        console.error('Text Analysis Error:', error);
        throw error;
    }
}
