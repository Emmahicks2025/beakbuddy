import { TrainingSessionLog, ParrotProfile, TrainingPlan, DietPlan, CareTask } from '../types';
import SubscriptionService from './subscriptionService';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: number;
}

// Simple event bus for Global Chat visibility
export const GlobalChatService = {
    listeners: [] as ((visible: boolean) => void)[],

    subscribe(listener: (visible: boolean) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    },

    restore() {
        this.listeners.forEach(l => l(true));
    }
};

export interface AppContext {
    profile: ParrotProfile | null;
    plans: TrainingPlan[];
    sessions: TrainingSessionLog[];
    diet: DietPlan | null;
    tasks: CareTask[];
}


import { Config } from '../config';

/**
 * Send chat message to AI with valid app context
 */
export async function sendChatToAI(
    messages: ChatMessage[],
    context: AppContext
): Promise<string> {
    const apiKey = Config.GEMINI_API_KEY;

    if (!apiKey || apiKey === "MISSING") {
        return "⚠️ Configuration Error: GEMINI_API_KEY is missing in config.ts";
    }

    const systemPrompt = buildSystemPrompt(context);
    const userQuery = messages[messages.length - 1]?.text || "";
    const unifiedPrompt = `
SYSTEM CONTEXT:
${systemPrompt}

USER QUESTION:
${userQuery}

Respond concisely and helpfuly.
    `;

    // Resilient model fallback loop
    const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
    let lastError = "";

    for (const model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: unifiedPrompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
                })
            });

            if (response.ok) {
                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return text;
            }

            // Handle specific API errors for this model
            const err = await response.json().catch(() => ({}));
            lastError = err.error?.message || 'Unknown API Error';
            console.warn(`AI Chat Attempt [${model}] failed:`, lastError);

            if (response.status === 403 || lastError.includes('key')) {
                return "⚠️ Access Denied: The API Key is invalid or restricted.";
            }

        } catch (e: any) {
            lastError = e.message || "Network request failed";
            console.error(`AI Chat Network Error [${model}]:`, lastError);
        }
    }

    return `❌ Assistant Error: All models failed. Last error: ${lastError}`;
}

function buildSystemPrompt(context: AppContext): string {
    const { profile, plans, sessions, diet, tasks } = context;

    const profileInfo = profile
        ? `Parrot: ${profile.displayName} (${profile.speciesId || 'Parrot'}), Age: Unknown` // Species ID logic might need name lookup if complex
        : "No active parrot profile.";

    const dietInfo = diet
        ? `Diet: ${diet.pelletsPercent}% pellets, ${diet.veggiesPercent}% veggies, ${diet.fruitsPercent}% fruits, ${diet.seedsPercent}% seeds.`
        : "No diet plan set.";

    const trainingInfo = plans.length > 0
        ? `Active Plans: ${plans.map(p => p.title).join(', ')}.`
        : "No active training plans.";

    const recentSession = sessions.length > 0
        ? `Last Session: ${new Date(sessions[0].date).toLocaleDateString()}, ${sessions[0].minutes} mins.`
        : "No recent training sessions.";

    const taskInfo = tasks.length > 0
        ? `Care Tasks: ${tasks.map(t => t.title).join(', ')}.`
        : "No care tasks.";

    return `You are a helpful, expert avian care assistant for a parrot owner.
    
Context Data:
${profileInfo}
${dietInfo}
${trainingInfo}
${recentSession}
${taskInfo}

Your Goal:
Answer the user's questions based on this data. 
- If they ask about food, use the diet plan.
- If they ask about training, refer to their plans and progress.
- Be encouraging, concise, and safe.
- If something is dangerous (like toxic food), warn them immediately.
- Keep responses short (under 3 sentences unless detailed advice is needed).
- Use an occasional parrot emoji 🦜.
- ALWAYS include a brief standard disclaimer if discussing health, diet, or behavior: "Note: AI advice—consult an avian vet for medical concerns."

System: Respond to the user's latest message.`;
}
