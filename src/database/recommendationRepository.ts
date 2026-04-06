// Recommendation Repository - Track AI recommendation state
import { StorageService } from '../services/StorageService';

export interface RecommendationRecord {
    id: string;
    planId: string;
    content: string;
    category: 'technique' | 'timing' | 'motivation' | 'progress';
    priority: 'high' | 'medium' | 'low';
    icon: string;
    title: string;
    description: string;
    createdAt: number;
    readAt: number | null;
    completedAt: number | null;
    contentHash: string; // To prevent duplicates
}

const STORAGE_KEY = 'parrot_app_recommendations';

class RecommendationRepository {
    private async getAll(): Promise<RecommendationRecord[]> {
        const stored = await StorageService.getItem(STORAGE_KEY);
        if (!stored) return [];
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse recommendations storage', e);
            return [];
        }
    }

    private async save(data: RecommendationRecord[]): Promise<void> {
        await StorageService.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    async add(recommendation: RecommendationRecord): Promise<void> {
        const all = await this.getAll();
        all.push(recommendation);
        await this.save(all);
    }

    async getByPlan(planId: string): Promise<RecommendationRecord[]> {
        const all = await this.getAll();
        return all.filter(r => r.planId === planId);
    }

    async getUnreadCountByPlan(planId: string): Promise<number> {
        const unread = await this.getUnreadByPlan(planId);
        return unread.length;
    }

    async getUnreadByPlan(planId: string): Promise<RecommendationRecord[]> {
        const all = await this.getByPlan(planId);
        return all.filter(r => r.readAt === null && r.completedAt === null);
    }

    async getActiveByPlan(planId: string): Promise<RecommendationRecord[]> {
        const all = await this.getByPlan(planId);
        return all.filter(r => r.completedAt === null);
    }

    async markAsRead(id: string): Promise<void> {
        const all = await this.getAll();
        const index = all.findIndex(r => r.id === id);
        if (index >= 0 && all[index].readAt === null) {
            all[index].readAt = Date.now();
            await this.save(all);
        }
    }

    async markAsCompleted(id: string): Promise<void> {
        const all = await this.getAll();
        const index = all.findIndex(r => r.id === id);
        if (index >= 0) {
            all[index].completedAt = Date.now();
            await this.save(all);
        }
    }

    async existsByHash(contentHash: string): Promise<boolean> {
        const all = await this.getAll();
        return all.some(r => r.contentHash === contentHash);
    }

    async deleteByPlan(planId: string): Promise<void> {
        const all = await this.getAll();
        const filtered = all.filter(r => r.planId !== planId);
        await this.save(filtered);
    }
}

export const recommendationRepository = new RecommendationRepository();

/**
 * Generate content hash for duplicate detection
 */
export function generateContentHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
}
