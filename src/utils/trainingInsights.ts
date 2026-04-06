// AI-Powered Training Insights Engine
import { TrainingSessionLog } from '../types';
import { TrainingTemplate } from './trainingTemplates';

export interface TrendAnalysis {
    successRateTrend: 'improving' | 'declining' | 'stable';
    successRateChange: number; // percentage change
    consistencyScore: number; // 0-100
    averageSessionsPerWeek: number;
    bestTimeOfDay: string;
    totalSessions: number;
    averageSuccessRate: number;
}

export interface Recommendation {
    id: string;
    priority: 'high' | 'medium' | 'low';
    category: 'timing' | 'technique' | 'consistency' | 'milestone';
    title: string;
    description: string;
    actionable: string;
    icon: string;
}

export interface Breakthrough {
    date: number;
    title: string;
    description: string;
    sessionId: string;
}

export interface ProgressPrediction {
    nextMilestoneETA: string;
    daysToCompletion: number;
    confidenceLevel: 'high' | 'medium' | 'low';
    reasoning: string;
}

export interface Warning {
    type: 'consistency' | 'performance' | 'schedule';
    severity: 'high' | 'medium' | 'low';
    message: string;
    suggestion: string;
}

export interface TrainingInsights {
    trends: TrendAnalysis;
    recommendations: Recommendation[];
    breakthroughs: Breakthrough[];
    prediction: ProgressPrediction | null;
    warnings: Warning[];
    quickStats: {
        currentStreak: number;
        sessionsThisWeek: number;
        nextMilestoneETA: string;
        successRateTrend: string;
    };
}

/**
 * Analyze session trends to identify patterns and performance changes
 */
export function analyzeSessionTrends(sessions: TrainingSessionLog[]): TrendAnalysis {
    if (sessions.length === 0) {
        return {
            successRateTrend: 'stable',
            successRateChange: 0,
            consistencyScore: 0,
            averageSessionsPerWeek: 0,
            bestTimeOfDay: 'morning',
            totalSessions: 0,
            averageSuccessRate: 0,
        };
    }

    // Calculate success rates for recent vs older sessions
    const recentSessions = sessions.slice(-5);
    const olderSessions = sessions.slice(0, -5);

    const calculateAvgSuccessRate = (sessionList: TrainingSessionLog[]) => {
        if (sessionList.length === 0) return 0;
        const rates = sessionList
            .filter(s => s.successRate !== undefined)
            .map(s => s.successRate || 0);
        return rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
    };

    const recentAvg = calculateAvgSuccessRate(recentSessions);
    const olderAvg = calculateAvgSuccessRate(olderSessions);
    const successRateChange = recentAvg - olderAvg;

    // Determine trend
    let successRateTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (successRateChange > 10) successRateTrend = 'improving';
    else if (successRateChange < -10) successRateTrend = 'declining';

    // Calculate consistency (how regularly sessions are done)
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const firstSession = Math.min(...sessions.map(s => s.date));
    const weeksActive = Math.max(1, (now - firstSession) / weekMs);
    const averageSessionsPerWeek = sessions.length / weeksActive;

    // Consistency score based on regularity
    const idealSessionsPerWeek = 5;
    const consistencyScore = Math.min(100, (averageSessionsPerWeek / idealSessionsPerWeek) * 100);

    // Find best time of day
    const timeOfDayCounts: Record<string, number> = { morning: 0, afternoon: 0, evening: 0 };
    sessions.forEach(s => {
        const hour = new Date(s.date).getHours();
        if (hour < 12) timeOfDayCounts.morning++;
        else if (hour < 18) timeOfDayCounts.afternoon++;
        else timeOfDayCounts.evening++;
    });
    const bestTimeOfDay = Object.entries(timeOfDayCounts).sort((a, b) => b[1] - a[1])[0][0];

    return {
        successRateTrend,
        successRateChange,
        consistencyScore,
        averageSessionsPerWeek,
        bestTimeOfDay,
        totalSessions: sessions.length,
        averageSuccessRate: calculateAvgSuccessRate(sessions),
    };
}

/**
 * Generate personalized recommendations based on session data and current progress
 */
export function generateRecommendations(
    sessions: TrainingSessionLog[],
    template: TrainingTemplate | null,
    currentWeek: number
): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const trends = analyzeSessionTrends(sessions);

    // Recommendation 1: Based on consistency
    if (trends.consistencyScore < 60) {
        recommendations.push({
            id: 'consistency-low',
            priority: 'high',
            category: 'consistency',
            title: 'Increase Training Frequency',
            description: `You're averaging ${trends.averageSessionsPerWeek.toFixed(1)} sessions per week. Consistency is key for parrot training.`,
            actionable: 'Aim for at least 5 sessions this week. Set daily reminders to help build the habit.',
            icon: '📅',
        });
    }

    // Recommendation 2: Based on success rate trend
    if (trends.successRateTrend === 'declining') {
        recommendations.push({
            id: 'performance-declining',
            priority: 'high',
            category: 'technique',
            title: 'Adjust Your Approach',
            description: `Success rate has dropped by ${Math.abs(trends.successRateChange).toFixed(0)}% recently.`,
            actionable: 'Review what worked in earlier sessions. Consider shorter sessions or higher-value rewards.',
            icon: '⚠️',
        });
    } else if (trends.successRateTrend === 'improving') {
        recommendations.push({
            id: 'performance-improving',
            priority: 'low',
            category: 'milestone',
            title: 'Great Progress!',
            description: `Success rate improved by ${trends.successRateChange.toFixed(0)}%. Keep up the momentum!`,
            actionable: 'Continue with your current approach. Consider progressing to more challenging exercises.',
            icon: '🎉',
        });
    }

    // Recommendation 3: Based on observed behaviors
    if (sessions.length > 0) {
        const recentSessions = sessions.slice(-3);
        const allObservedBehaviors = recentSessions
            .flatMap(s => s.observedBehaviors || []);

        if (allObservedBehaviors.length > 0) {
            const behaviorCounts: Record<string, number> = {};
            allObservedBehaviors.forEach(b => {
                behaviorCounts[b] = (behaviorCounts[b] || 0) + 1;
            });

            const mostCommon = Object.entries(behaviorCounts).sort((a, b) => b[1] - a[1])[0];
            if (mostCommon && template) {
                const observable = template.generalObservables?.find(o => o.id === mostCommon[0]);
                if (observable) {
                    recommendations.push({
                        id: 'behavior-pattern',
                        priority: 'medium',
                        category: 'technique',
                        title: 'Leverage Observed Pattern',
                        description: `You've consistently observed: "${observable.description}"`,
                        actionable: 'This is a strong signal! Time your rewards immediately (within 2 seconds) when you see this behavior.',
                        icon: '🎯',
                    });
                }
            }
        }
    }

    // Recommendation 4: Best time of day
    if (sessions.length >= 5) {
        recommendations.push({
            id: 'timing-optimal',
            priority: 'low',
            category: 'timing',
            title: `Best Training Time: ${trends.bestTimeOfDay.charAt(0).toUpperCase() + trends.bestTimeOfDay.slice(1)}`,
            description: `Your most successful sessions happen in the ${trends.bestTimeOfDay}.`,
            actionable: `Schedule future sessions in the ${trends.bestTimeOfDay} for optimal results.`,
            icon: '⏰',
        });
    }

    // Recommendation 5: Milestone-specific advice
    if (template && currentWeek <= template.milestones.length) {
        const currentMilestone = template.milestones.find(m => m.week === currentWeek);
        if (currentMilestone) {
            recommendations.push({
                id: 'milestone-focus',
                priority: 'medium',
                category: 'milestone',
                title: `Focus: ${currentMilestone.title}`,
                description: currentMilestone.description,
                actionable: `This week's goal: ${currentMilestone.description}. Track progress in the Milestones tab.`,
                icon: '🎯',
            });
        }
    }

    return recommendations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

/**
 * Identify breakthrough moments in training history
 */
export function identifyBreakthroughs(sessions: TrainingSessionLog[]): Breakthrough[] {
    const breakthroughs: Breakthrough[] = [];

    sessions.forEach((session, index) => {
        // Breakthrough 1: First session with >80% success rate
        if (session.successRate && session.successRate >= 80) {
            const isPrevious = sessions.slice(0, index).some(s => s.successRate && s.successRate >= 80);
            if (!isPrevious) {
                breakthroughs.push({
                    date: session.date,
                    title: 'First High Success Rate!',
                    description: `Achieved ${session.successRate}% success rate`,
                    sessionId: session.id,
                });
            }
        }

        // Breakthrough 2: Marked as breakthrough in summary
        if (session.hadBreakthrough && session.breakthroughDescription) {
            breakthroughs.push({
                date: session.date,
                title: 'Training Breakthrough',
                description: session.breakthroughDescription,
                sessionId: session.id,
            });
        }

        // Breakthrough 3: First time completing a milestone
        if (session.completedMilestones && session.completedMilestones.length > 0) {
            session.completedMilestones.forEach(milestone => {
                const isPreviouslyCompleted = sessions
                    .slice(0, index)
                    .some(s => s.completedMilestones?.includes(milestone));

                if (!isPreviouslyCompleted) {
                    breakthroughs.push({
                        date: session.date,
                        title: 'Milestone Achieved!',
                        description: milestone,
                        sessionId: session.id,
                    });
                }
            });
        }
    });

    return breakthroughs.sort((a, b) => b.date - a.date);
}

/**
 * Predict progress and estimate milestone completion
 */
export function calculateProgressPrediction(
    sessions: TrainingSessionLog[],
    template: TrainingTemplate | null,
    currentWeek: number
): ProgressPrediction | null {
    if (!template || sessions.length < 2) return null;

    const trends = analyzeSessionTrends(sessions);
    const nextMilestone = template.milestones.find(m => m.week > currentWeek);

    if (!nextMilestone) {
        return {
            nextMilestoneETA: 'Completed!',
            daysToCompletion: 0,
            confidenceLevel: 'high',
            reasoning: 'All milestones completed. Great work!',
        };
    }

    // Calculate ETA based on current pace
    const weeksUntilMilestone = nextMilestone.week - currentWeek;
    const daysPerWeek = 7;
    const daysToCompletion = weeksUntilMilestone * daysPerWeek;

    // Adjust based on consistency
    let confidenceLevel: 'high' | 'medium' | 'low' = 'medium';
    if (trends.consistencyScore > 80) confidenceLevel = 'high';
    else if (trends.consistencyScore < 40) confidenceLevel = 'low';

    const etaDate = new Date(Date.now() + daysToCompletion * 24 * 60 * 60 * 1000);
    const nextMilestoneETA = etaDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    let reasoning = `Based on your current pace of ${trends.averageSessionsPerWeek.toFixed(1)} sessions/week`;
    if (confidenceLevel === 'low') {
        reasoning += '. Increase consistency for more accurate prediction.';
    }

    return {
        nextMilestoneETA,
        daysToCompletion,
        confidenceLevel,
        reasoning,
    };
}

/**
 * Detect warning signs in training patterns
 */
export function detectWarnings(sessions: TrainingSessionLog[]): Warning[] {
    const warnings: Warning[] = [];
    const trends = analyzeSessionTrends(sessions);

    // Warning 1: Low consistency
    if (trends.consistencyScore < 40 && sessions.length >= 3) {
        warnings.push({
            type: 'consistency',
            severity: 'high',
            message: 'Training frequency is too low',
            suggestion: 'Parrots learn best with regular, consistent practice. Aim for at least 4-5 sessions per week.',
        });
    }

    // Warning 2: Declining performance
    if (trends.successRateTrend === 'declining' && sessions.length >= 5) {
        warnings.push({
            type: 'performance',
            severity: 'medium',
            message: 'Success rate is declining',
            suggestion: 'Your parrot may be losing interest or the exercises are too challenging. Try shorter sessions with higher-value rewards.',
        });
    }

    // Warning 3: Long gap since last session
    if (sessions.length > 0) {
        const lastSession = Math.max(...sessions.map(s => s.date));
        const daysSinceLastSession = (Date.now() - lastSession) / (24 * 60 * 60 * 1000);

        if (daysSinceLastSession > 3) {
            warnings.push({
                type: 'schedule',
                severity: 'medium',
                message: `It's been ${Math.floor(daysSinceLastSession)} days since your last session`,
                suggestion: 'Long gaps can slow progress. Try to maintain a regular schedule.',
            });
        }
    }

    return warnings;
}

/**
 * Generate complete training insights
 */
export function generateTrainingInsights(
    sessions: TrainingSessionLog[],
    template: TrainingTemplate | null,
    currentWeek: number
): TrainingInsights {
    const trends = analyzeSessionTrends(sessions);
    const recommendations = generateRecommendations(sessions, template, currentWeek);
    const breakthroughs = identifyBreakthroughs(sessions);
    const prediction = calculateProgressPrediction(sessions, template, currentWeek);
    const warnings = detectWarnings(sessions);

    // Calculate current streak
    const sortedSessions = [...sessions].sort((a, b) => b.date - a.date);
    let currentStreak = 0;
    let lastDate = Date.now();

    for (const session of sortedSessions) {
        const daysDiff = (lastDate - session.date) / (24 * 60 * 60 * 1000);
        if (daysDiff <= 2) { // Allow 1 day gap
            currentStreak++;
            lastDate = session.date;
        } else {
            break;
        }
    }

    // Sessions this week
    const weekStart = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const sessionsThisWeek = sessions.filter(s => s.date >= weekStart).length;

    // Success rate trend emoji
    const successRateTrendEmoji =
        trends.successRateTrend === 'improving' ? '📈 Improving' :
            trends.successRateTrend === 'declining' ? '📉 Declining' :
                '➡️ Stable';

    return {
        trends,
        recommendations,
        breakthroughs,
        prediction,
        warnings,
        quickStats: {
            currentStreak,
            sessionsThisWeek,
            nextMilestoneETA: prediction?.nextMilestoneETA || 'N/A',
            successRateTrend: successRateTrendEmoji,
        },
    };
}
