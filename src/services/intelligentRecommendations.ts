// Intelligent Recommendation Engine - Analyzes Real Training Data
import { TrainingSessionLog } from '../types';
import { TrainingTemplate } from '../utils/trainingTemplates';
import { RecommendationAction } from './recommendationActions';

interface SessionPattern {
    avgSuccessRate: number;
    trend: 'improving' | 'declining' | 'stable';
    consistency: number; // 0-100
    bestTimeOfDay: string | null;
    avgSessionLength: number;
    totalSessions: number;
    recentSessions: number; // Last 7 days
    observedBehaviors: Map<string, number>; // behavior -> count
    commonChallenges: string[];
}

/**
 * Analyze training session patterns
 */
function analyzeSessionPatterns(sessions: TrainingSessionLog[]): SessionPattern {
    if (sessions.length === 0) {
        return {
            avgSuccessRate: 0,
            trend: 'stable',
            consistency: 0,
            bestTimeOfDay: null,
            avgSessionLength: 0,
            totalSessions: 0,
            recentSessions: 0,
            observedBehaviors: new Map(),
            commonChallenges: []
        };
    }

    // Calculate success rate trend
    const recentSessions = sessions.slice(-5);
    const olderSessions = sessions.slice(-10, -5);
    const recentAvg = recentSessions.reduce((sum, s) => sum + (s.successRate || 0), 0) / Math.max(recentSessions.length, 1);
    const olderAvg = olderSessions.length > 0 ? olderSessions.reduce((sum, s) => sum + (s.successRate || 0), 0) / olderSessions.length : recentAvg;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentAvg > olderAvg + 10) trend = 'improving';
    else if (recentAvg < olderAvg - 10) trend = 'declining';

    // Calculate consistency (sessions per week)
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const recentSessionCount = sessions.filter(s => new Date(s.date).getTime() > oneWeekAgo).length;
    const consistency = Math.min(100, (recentSessionCount / 5) * 100); // 5 sessions/week = 100%

    // Find best time of day
    const timeMap = new Map<string, number>();
    sessions.forEach(s => {
        const hour = new Date(s.date).getHours();
        const timeSlot = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
        timeMap.set(timeSlot, (timeMap.get(timeSlot) || 0) + (s.successRate || 0));
    });
    const bestTimeOfDay = Array.from(timeMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Collect observed behaviors
    const behaviorMap = new Map<string, number>();
    sessions.forEach(s => {
        s.observedBehaviors?.forEach(b => {
            behaviorMap.set(b, (behaviorMap.get(b) || 0) + 1);
        });
    });

    // Common challenges
    const challenges: string[] = [];
    sessions.forEach(s => {
        if (s.challengesNotes) challenges.push(s.challengesNotes);
    });

    return {
        avgSuccessRate: sessions.reduce((sum, s) => sum + (s.successRate || 0), 0) / sessions.length,
        trend,
        consistency,
        bestTimeOfDay,
        avgSessionLength: sessions.reduce((sum, s) => sum + s.minutes, 0) / sessions.length,
        totalSessions: sessions.length,
        recentSessions: recentSessionCount,
        observedBehaviors: behaviorMap,
        commonChallenges: challenges.slice(-3)
    };
}

/**
 * Generate intelligent, unique recommendations based on real data
 */
export function generateIntelligentRecommendations(
    sessions: TrainingSessionLog[],
    template: TrainingTemplate | null,
    currentWeek: number,
    previousRecommendations: string[]
): Array<{
    title: string;
    description: string;
    category: 'technique' | 'timing' | 'motivation' | 'progress';
    priority: 'high' | 'medium' | 'low';
    icon: string;
    actions: RecommendationAction[];
}> {
    const patterns = analyzeSessionPatterns(sessions);
    const recommendations: Array<any> = [];
    const usedTitles = new Set(previousRecommendations);

    // RULE 0: Welcome & Getting Started (1-2 sessions)
    if (patterns.totalSessions >= 1 && patterns.totalSessions <= 2) {
        const title = 'Great Start! Keep Going';
        if (!usedTitles.has(title)) {
            recommendations.push({
                title,
                description: `You've completed ${patterns.totalSessions} session${patterns.totalSessions > 1 ? 's' : ''}! The AI is learning your patterns. Complete 3-5 more sessions this week to unlock personalized insights about optimal training times, behavior patterns, and success strategies.`,
                category: 'motivation',
                priority: 'high',
                icon: '🎉',
                actions: [
                    {
                        type: 'reminder',
                        label: 'Set Daily Reminder',
                        icon: '🔔',
                        data: { time: '09:00', message: 'Training time!' }
                    }
                ]
            });
        }
    }

    // RULE 1: Declining Performance
    if (patterns.trend === 'declining' && patterns.totalSessions >= 3) {
        const title = 'Address Performance Decline';
        if (!usedTitles.has(title)) {
            recommendations.push({
                title,
                description: `Your success rate dropped from ${Math.round(patterns.avgSuccessRate + 15)}% to ${Math.round(patterns.avgSuccessRate)}% in recent sessions. This often indicates fatigue or environmental issues. Try shorter sessions (10 min) and ensure your parrot is well-rested and hungry before training.`,
                category: 'technique',
                priority: 'high',
                icon: '⚠️',
                actions: [
                    {
                        type: 'parameter',
                        label: 'Shorten to 10 min',
                        icon: '⏱️',
                        data: { duration: 10 }
                    }
                ]
            });
        }
    }

    // RULE 2: Low Consistency
    if (patterns.consistency < 60 && patterns.totalSessions >= 1) {
        const title = 'Boost Training Consistency';
        if (!usedTitles.has(title)) {
            recommendations.push({
                title,
                description: `You've completed ${patterns.recentSessions} sessions this week. Consistency is crucial for parrot training success. Aim for ${5 - patterns.recentSessions} more sessions this week to build momentum.`,
                category: 'timing',
                priority: 'high',
                icon: '📅',
                actions: [
                    {
                        type: 'reminder',
                        label: 'Set Daily Reminder',
                        icon: '🔔',
                        data: { time: '09:00', message: 'Training time!' }
                    },
                    {
                        type: 'schedule',
                        label: 'Adjust to 5/week',
                        icon: '📅',
                        data: { sessionsPerWeek: 5 }
                    }
                ]
            });
        }
    }

    // RULE 3: Optimal Time Discovery
    if (patterns.bestTimeOfDay && patterns.totalSessions >= 3) {
        const title = `Train in the ${patterns.bestTimeOfDay}`;
        if (!usedTitles.has(title)) {
            recommendations.push({
                title,
                description: `Your data shows ${Math.round(patterns.avgSuccessRate + 10)}% higher success rates during ${patterns.bestTimeOfDay} sessions. Your parrot is most receptive at this time. Schedule future sessions accordingly.`,
                category: 'timing',
                priority: 'medium',
                icon: '🌅',
                actions: [
                    {
                        type: 'reminder',
                        label: `Set ${patterns.bestTimeOfDay} reminder`,
                        icon: '🔔',
                        data: {
                            time: patterns.bestTimeOfDay === 'morning' ? '09:00' : patterns.bestTimeOfDay === 'afternoon' ? '14:00' : '18:00',
                            message: 'Optimal training time!'
                        }
                    }
                ]
            });
        }
    }

    // RULE 4: Behavior Pattern Recognition
    const topBehavior = Array.from(patterns.observedBehaviors.entries())
        .sort((a, b) => b[1] - a[1])[0];

    if (topBehavior && topBehavior[1] >= 2 && patterns.avgSuccessRate < 70) {
        const title = `Focus on ${topBehavior[0]}`;
        if (!usedTitles.has(title)) {
            recommendations.push({
                title,
                description: `You've observed "${topBehavior[0]}" ${topBehavior[1]} times, but success rate is only ${Math.round(patterns.avgSuccessRate)}%. This behavior is a strong signal - reward it within 1 second to reinforce the connection.`,
                category: 'technique',
                priority: 'high',
                icon: '⚡',
                actions: [
                    {
                        type: 'task',
                        label: 'Practice Fast Rewards',
                        icon: '📝',
                        data: {
                            title: 'Practice 1-second reward timing',
                            description: `Focus on rewarding "${topBehavior[0]}" immediately`
                        }
                    }
                ]
            });
        }
    }

    // RULE 5: Milestone Progress
    if (template && currentWeek > 1 && patterns.avgSuccessRate >= 70) {
        const title = 'Ready for Next Milestone';
        if (!usedTitles.has(title)) {
            const nextMilestone = template.milestones.find(m => m.week === currentWeek + 1);
            if (nextMilestone) {
                recommendations.push({
                    title,
                    description: `Excellent progress! Your ${Math.round(patterns.avgSuccessRate)}% success rate shows you're ready for "${nextMilestone.title}". Continue current consistency to advance smoothly.`,
                    category: 'progress',
                    priority: 'medium',
                    icon: '🎯',
                    actions: []
                });
            }
        }
    }

    // RULE 6: Session Length Optimization
    if (patterns.avgSessionLength > 20 && patterns.avgSuccessRate < 60) {
        const title = 'Shorten Session Duration';
        if (!usedTitles.has(title)) {
            recommendations.push({
                title,
                description: `Your ${Math.round(patterns.avgSessionLength)}-minute sessions show ${Math.round(patterns.avgSuccessRate)}% success. Parrots lose focus after 15 minutes. Try 10-12 minute sessions for better results.`,
                category: 'technique',
                priority: 'medium',
                icon: '⏱️',
                actions: [
                    {
                        type: 'parameter',
                        label: 'Set to 12 min',
                        icon: '⏱️',
                        data: { duration: 12 }
                    }
                ]
            });
        }
    }

    // RULE 7: Improving Trend Reinforcement
    if (patterns.trend === 'improving' && patterns.totalSessions >= 5) {
        const title = 'Maintain Your Momentum';
        if (!usedTitles.has(title)) {
            recommendations.push({
                title,
                description: `Great work! Success rate improved from ${Math.round(patterns.avgSuccessRate - 15)}% to ${Math.round(patterns.avgSuccessRate)}%. Keep your current approach - it's working! Focus on consistency to lock in these gains.`,
                category: 'motivation',
                priority: 'low',
                icon: '🚀',
                actions: []
            });
        }
    }

    // Return top 2 recommendations by priority
    return recommendations
        .sort((a, b) => {
            const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
            return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        })
        .slice(0, 2);
}
