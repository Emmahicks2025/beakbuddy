// AI-Powered Recommendations Service with Inbox Integration
import { TrainingSessionLog } from '../types';
import { TrainingTemplate } from '../utils/trainingTemplates';
import { recommendationRepository, RecommendationRecord, generateContentHash } from '../database/recommendationRepository';
import { RecommendationAction, parseActionsFromRecommendation } from './recommendationActions';
import { Config } from '../config';

export interface AIRecommendation {
    id: string;
    category: 'technique' | 'timing' | 'motivation' | 'progress';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    icon: string;
    isNew: boolean;
    isRead: boolean;
    actions: RecommendationAction[]; // Actionable buttons
}

/**
 * Generate and store AI-powered recommendations
 * Returns only active (not completed) recommendations
 */
export async function generateAIRecommendations(
    planId: string,
    sessions: TrainingSessionLog[],
    template: TrainingTemplate | null,
    currentWeek: number
): Promise<AIRecommendation[]> {
    try {
        // Get existing active recommendations
        const existing = await recommendationRepository.getActiveByPlan(planId);

        // Only generate new ones if we have fewer than 2 active recommendations
        if (existing.length < 2 && sessions.length > 0) {
            const newRecs = await generateNewRecommendations(planId, sessions, template, currentWeek, existing);
            // Store new recommendations
            for (const rec of newRecs) {
                await recommendationRepository.add(rec);
            }
        }

        // Return all active recommendations
        const active = await recommendationRepository.getActiveByPlan(planId);
        return active.map(r => ({
            id: r.id,
            category: r.category,
            title: r.title,
            description: r.description,
            priority: r.priority,
            icon: r.icon,
            isNew: r.readAt === null,
            isRead: r.readAt !== null,
            actions: parseActionsFromRecommendation(r.title, r.description),
        }));
    } catch (error) {
        console.error('AI recommendation error:', error);
        return [];
    }
}

/**
 * Generate new unique recommendations
 */
async function generateNewRecommendations(
    planId: string,
    sessions: TrainingSessionLog[],
    template: TrainingTemplate | null,
    currentWeek: number,
    existing: RecommendationRecord[]
): Promise<RecommendationRecord[]> {
    try {
        const apiKey = Config.GEMINI_API_KEY;

        if (!apiKey) {
            console.log('No Gemini API key, using local analysis');
            return generateLocalRecommendations(planId, sessions, template, currentWeek, existing);
        }

        const prompt = buildEnhancedPrompt(sessions, template, currentWeek, existing);

        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiText) throw new Error('No AI response');

        return await parseAndValidateRecommendations(planId, aiText, existing);
    } catch (error) {
        console.error('AI generation error:', error);
        return generateLocalRecommendations(planId, sessions, template, currentWeek, existing);
    }
}

/**
 * Build enhanced prompt that ensures unique, specific recommendations
 */
function buildEnhancedPrompt(
    sessions: TrainingSessionLog[],
    template: TrainingTemplate | null,
    currentWeek: number,
    existing: RecommendationRecord[]
): string {
    const recentSessions = sessions.slice(-5);
    const sessionDetails = recentSessions.map((s, i) => {
        const date = new Date(s.date).toLocaleDateString();
        const behaviors = s.observedBehaviors?.join(', ') || 'none';
        return `Session ${i + 1} (${date}): ${s.activity || 'Training'}, ${s.minutes}min, ${s.successRate || 0}% success, Observed: ${behaviors}, Notes: ${s.notes || 'none'}`;
    }).join('\n');

    const previousRecs = existing.map(r => r.title).join(', ');

    return `You are an expert parrot training coach analyzing real training data.

Training Plan: ${template?.title || 'General Training'}
Current Phase: Week ${currentWeek}
Total Sessions: ${sessions.length}
Recent Performance: ${recentSessions.length > 0 ? Math.round(recentSessions.reduce((sum, s) => sum + (s.successRate || 0), 0) / recentSessions.length) : 0}% avg success

Recent Session Data:
${sessionDetails}

${previousRecs ? `IMPORTANT: You already gave these recommendations: ${previousRecs}. DO NOT repeat them.` : ''}

Generate EXACTLY 1 NEW, UNIQUE recommendation in JSON format:
{
  "category": "technique|timing|motivation|progress",
  "title": "Specific actionable title (max 6 words)",
  "description": "Detailed explanation with SPECIFIC data from sessions above (2-3 sentences)",
  "priority": "high|medium|low",
  "icon": "emoji"
}

CRITICAL RULES:
1. Reference SPECIFIC data (dates, behaviors, numbers) from sessions above
2. Be UNIQUE - never generic advice
3. Must be different from previous recommendations
4. Focus on ONE specific improvement
5. Use actual session data to justify the recommendation

Example GOOD recommendation:
{
  "category": "technique",
  "title": "Reward tail-lifting faster",
  "description": "In your last 3 sessions, you observed tail-lifting behavior but success rate was only 45%. This suggests timing issues. Try rewarding within 1 second of seeing the tail lift instead of waiting for full bathroom use.",
  "priority": "high",
  "icon": "⚡"
}

Example BAD (too generic):
{
  "title": "Be more consistent",
  "description": "Consistency is key for training success."
}`;
}

/**
 * Parse AI response and validate for duplicates
 */
async function parseAndValidateRecommendations(
    planId: string,
    aiText: string,
    existing: RecommendationRecord[]
): Promise<RecommendationRecord[]> {
    try {
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return [];

        const parsed = JSON.parse(jsonMatch[0]);
        const contentHash = generateContentHash(parsed.title + parsed.description);

        // Check if duplicate
        const isDuplicate = await recommendationRepository.existsByHash(contentHash);
        if (isDuplicate) {
            console.log('Duplicate recommendation detected, skipping');
            return [];
        }

        const rec: RecommendationRecord = {
            id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            planId,
            content: aiText,
            category: parsed.category || 'progress',
            priority: parsed.priority || 'medium',
            icon: parsed.icon || '💡',
            title: parsed.title || 'Recommendation',
            description: parsed.description || '',
            createdAt: Date.now(),
            readAt: null,
            completedAt: null,
            contentHash,
        };

        return [rec];
    } catch (error) {
        console.error('Parse error:', error);
        return [];
    }
}

/**
 * Fallback to intelligent local recommendations
 */
async function generateLocalRecommendations(
    planId: string,
    sessions: TrainingSessionLog[],
    template: TrainingTemplate | null,
    currentWeek: number,
    existing: RecommendationRecord[]
): Promise<RecommendationRecord[]> {
    // Use intelligent recommendation engine
    const { generateIntelligentRecommendations } = require('./intelligentRecommendations');
    const previousTitles = existing.map(r => r.title);
    const intelligentRecs = generateIntelligentRecommendations(sessions, template, currentWeek, previousTitles);

    const newRecs: RecommendationRecord[] = [];

    for (const rec of intelligentRecs) {
        const contentHash = generateContentHash(rec.title + rec.description);
        const isDuplicate = await recommendationRepository.existsByHash(contentHash);

        if (!isDuplicate) {
            newRecs.push({
                id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                planId,
                content: rec.description,
                category: rec.category,
                priority: rec.priority,
                icon: rec.icon,
                title: rec.title,
                description: rec.description,
                createdAt: Date.now(),
                readAt: null,
                completedAt: null,
                contentHash,
            });
        }
    }

    return newRecs;
}

/**
 * Mark recommendation as read
 */
export async function markRecommendationAsRead(id: string): Promise<void> {
    await recommendationRepository.markAsRead(id);
}

/**
 * Mark recommendation as completed
 */
export async function markRecommendationAsCompleted(id: string): Promise<void> {
    await recommendationRepository.markAsCompleted(id);
}
