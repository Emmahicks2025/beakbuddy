// Core type definitions for BeakBuddy app

export type ThemeMode = 'light' | 'dark' | 'system';

export type AppMode = 'owner' | null;

export type SizeCategory = 'Small' | 'Medium' | 'Large';

export type SensitivityTag = 'Normal' | 'Sensitive';

export type FoodVerdict = 'SAFE' | 'TOXIC' | 'UNKNOWN';

export type Schedule = 'Daily' | 'Weekly' | 'Monthly';

// Database models
export interface Species {
    id: string;
    commonName: string;
    scientificName: string;
    popularityRank: number;
    sizeCategory: SizeCategory;
    sensitivityTag: SensitivityTag;
    imageAsset: string;
}

export interface ParrotProfile {
    id: string;
    displayName: string;
    speciesId: string;
    avatarAsset: string;
    createdAt: number;
}

export interface FoodItem {
    id: string;
    name: string;
    aliases: string;
    verdict: FoodVerdict;
    confidence: number;
    notes: string;
    symptoms: string;
    servingTips: string;
    sourceNote: string;
}

export interface UserMarkedFood {
    id: string;
    profileId: string;
    foodId: string;
    userVerdict: FoodVerdict;
    userNote: string;
    createdAt: number;
}

export interface TrainingPlan {
    id: string;
    profileId: string;
    title: string;
    goal: string;
    sessionsPerWeek: number;
    sessionDuration?: number; // minutes
    targetBehaviors?: string[]; // behaviors suggested by AI to watch for
    templateId?: string; // Optional: links to training template
    createdAt: number;
}

export interface TrainingSessionLog {
    id: string;
    profileId: string;
    planId: string;
    date: number;
    minutes: number;
    activity: string;
    notes: string;

    // Pre-session assessment
    birdMoodBefore?: 'calm' | 'excited' | 'distracted' | 'tired';
    energyLevel?: 'high' | 'medium' | 'low';
    hungerLevel?: 'very-hungry' | 'hungry' | 'satisfied' | 'full';
    environmentQuality?: 'quiet' | 'some-distractions' | 'noisy';

    // Training method
    trainingMethod?: 'clicker' | 'target' | 'shaping' | 'luring' | 'capturing' | 'other';
    reinforcementType?: string; // e.g., "sunflower seeds", "praise", "head scratches"

    // Performance metrics
    attempts?: number;
    successes?: number;
    successRate?: number; // percentage
    averageLatency?: number; // seconds from cue to response
    qualityRating?: number; // 1-5 stars

    // Post-session outcomes
    goalAchievement?: 'not-met' | 'partially-met' | 'fully-met' | 'exceeded';
    birdMoodAfter?: 'happy' | 'neutral' | 'frustrated' | 'tired';
    hadBreakthrough?: number; // SQLite boolean (0 or 1)
    breakthroughDescription?: string;

    // Detailed notes
    challengesNotes?: string;
    whatWorkedWell?: string;
    nextSessionPlan?: string;

    // Tracking
    observedBehaviors?: string[];
    completedMilestones?: string[];
}

export interface DietPlan {
    id: string;
    profileId: string;
    pelletsPercent: number;
    veggiesPercent: number;
    fruitsPercent: number;
    seedsPercent: number;
    notes: string;
}

export interface DietLog {
    id: string;
    profileId: string;
    date: number;
    items: string[];
    notes: string;
}

export interface CareTask {
    id: string;
    profileId: string;
    title: string;
    schedule: Schedule; // 'Daily', 'Weekly', 'Monthly'
    isDone: number; // 0 or 1
    lastDoneAt: number | null; // Timestamp
    reminderTime?: string; // HH:mm for daily reminders
    streak?: number; // Current streak of consecutive completions
}




export interface CareTaskHistory {
    id: string;
    profileId: string;
    taskId: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    notes?: string;
    timestamp: number;
}

export interface ShoppingListItem {
    id: string;
    profileId: string;
    text: string;
    isChecked: boolean;
    category?: 'food' | 'toy' | 'supply' | 'other';
    createdAt: number;
}
