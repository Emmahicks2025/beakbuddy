// Repository layer for database operations
import { Platform } from 'react-native';
import { getDatabase } from './init';
import {
    WebSpeciesRepository, WebProfileRepository, WebFoodRepository,
    WebUserMarkedFoodRepository, WebTrainingPlanRepository,
    WebTrainingSessionRepository, WebDietPlanRepository, WebCareTaskRepository,
    WebCareTaskHistoryRepository,
    WebDietLogRepository,
    WebShoppingListRepository
} from './webRepository';
import {
    Species, ParrotProfile, FoodItem, UserMarkedFood,
    TrainingPlan, TrainingSessionLog, DietPlan, CareTask, CareTaskHistory,
    DietLog,
    SizeCategory, SensitivityTag, FoodVerdict, Schedule, ShoppingListItem
} from '../types';

// Species Repository
export const SpeciesRepository = {
    getAll: async (): Promise<Species[]> => {
        if (Platform.OS === 'web') return WebSpeciesRepository.getAll();
        const db = getDatabase();
        return await db.getAllAsync('SELECT * FROM species ORDER BY popularityRank') as Species[];
    },

    getById: async (id: string): Promise<Species | null> => {
        if (Platform.OS === 'web') return WebSpeciesRepository.getById(id);
        const db = getDatabase();
        return await db.getFirstAsync('SELECT * FROM species WHERE id = ?', [id]) as Species | null;
    },

    search: async (query: string): Promise<Species[]> => {
        if (Platform.OS === 'web') return WebSpeciesRepository.search(query);
        const db = getDatabase();
        const searchTerm = `%${query}%`;
        return await db.getAllAsync(
            'SELECT * FROM species WHERE commonName LIKE ? OR scientificName LIKE ? ORDER BY popularityRank',
            [searchTerm, searchTerm]
        ) as Species[];
    },

    filterBySize: async (size: SizeCategory): Promise<Species[]> => {
        if (Platform.OS === 'web') return WebSpeciesRepository.filterBySize(size);
        const db = getDatabase();
        return await db.getAllAsync(
            'SELECT * FROM species WHERE sizeCategory = ? ORDER BY popularityRank',
            [size]
        ) as Species[];
    },

    filterBySensitivity: async (sensitivity: SensitivityTag): Promise<Species[]> => {
        if (Platform.OS === 'web') return WebSpeciesRepository.filterBySensitivity(sensitivity);
        const db = getDatabase();
        return await db.getAllAsync(
            'SELECT * FROM species WHERE sensitivityTag = ? ORDER BY popularityRank',
            [sensitivity]
        ) as Species[];
    },

    getPopular: async (limit: number = 10): Promise<Species[]> => {
        if (Platform.OS === 'web') return WebSpeciesRepository.getPopular(limit);
        const db = getDatabase();
        return await db.getAllAsync(
            'SELECT * FROM species ORDER BY popularityRank LIMIT ?',
            [limit]
        ) as Species[];
    },
};

// Profile Repository
export const ProfileRepository = {
    create: async (profile: Omit<ParrotProfile, 'id' | 'createdAt'>): Promise<string> => {
        if (Platform.OS === 'web') return WebProfileRepository.create(profile);
        const db = getDatabase();
        const id = `profile_${Date.now()}`;
        const createdAt = Date.now();

        console.log('Repo: Creating profile:', profile.displayName, 'with ID:', id);

        try {
            await db.runAsync(
                'INSERT INTO parrot_profile (id, displayName, speciesId, avatarAsset, createdAt) VALUES (?, ?, ?, ?, ?)',
                [id, profile.displayName, profile.speciesId, profile.avatarAsset, createdAt]
            );
            console.log('Repo: Profile created successfully');
            return id;
        } catch (error) {
            console.error('Repo: Failed to create profile:', error);
            throw error;
        }
    },

    getAll: async (): Promise<ParrotProfile[]> => {
        if (Platform.OS === 'web') return WebProfileRepository.getAll();
        const db = getDatabase();
        console.log('Repo: Fetching all profiles...');
        try {
            const profiles = await db.getAllAsync('SELECT * FROM parrot_profile ORDER BY createdAt DESC') as ParrotProfile[];
            console.log('Repo: Found profiles:', profiles.length);
            return profiles;
        } catch (error) {
            console.error('Repo: Failed to fetch profiles:', error);
            throw error;
        }
    },

    getById: async (id: string): Promise<ParrotProfile | null> => {
        if (Platform.OS === 'web') return WebProfileRepository.getById(id);
        const db = getDatabase();
        console.log('Repo: Fetching profile by ID:', id);
        return await db.getFirstAsync('SELECT * FROM parrot_profile WHERE id = ?', [id]) as ParrotProfile | null;
    },

    update: async (id: string, updates: Partial<ParrotProfile>): Promise<void> => {
        if (Platform.OS === 'web') return WebProfileRepository.update(id, updates);
        const db = getDatabase();
        const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(updates), id];

        console.log('Repo: Updating profile:', id, 'Updates:', Object.keys(updates));
        await db.runAsync(
            `UPDATE parrot_profile SET ${fields} WHERE id = ?`,
            values
        );
    },

    delete: async (id: string): Promise<void> => {
        if (Platform.OS === 'web') return WebProfileRepository.delete(id);
        const db = getDatabase();
        console.log('Repo: Deleting profile:', id);
        await db.runAsync('DELETE FROM parrot_profile WHERE id = ?', [id]);
    },
};

// Food Repository
export const FoodRepository = {
    getAll: async (): Promise<FoodItem[]> => {
        if (Platform.OS === 'web') return WebFoodRepository.getAll();
        const db = getDatabase();
        return await db.getAllAsync('SELECT * FROM food_item ORDER BY name') as FoodItem[];
    },

    getById: async (id: string): Promise<FoodItem | null> => {
        if (Platform.OS === 'web') return WebFoodRepository.getById(id);
        const db = getDatabase();
        return await db.getFirstAsync('SELECT * FROM food_item WHERE id = ?', [id]) as FoodItem | null;
    },

    search: async (query: string): Promise<FoodItem[]> => {
        if (Platform.OS === 'web') return WebFoodRepository.search(query);
        const db = getDatabase();
        const searchTerm = `%${query}%`;
        return await db.getAllAsync(
            'SELECT * FROM food_item WHERE name LIKE ? OR aliases LIKE ? ORDER BY name',
            [searchTerm, searchTerm]
        ) as FoodItem[];
    },

    getByVerdict: async (verdict: FoodVerdict): Promise<FoodItem[]> => {
        if (Platform.OS === 'web') return WebFoodRepository.getByVerdict(verdict);
        const db = getDatabase();
        return await db.getAllAsync(
            'SELECT * FROM food_item WHERE verdict = ? ORDER BY name',
            [verdict]
        ) as FoodItem[];
    },
};

// User Marked Food Repository
export const UserMarkedFoodRepository = {
    create: async (data: Omit<UserMarkedFood, 'id' | 'createdAt'>): Promise<string> => {
        if (Platform.OS === 'web') return WebUserMarkedFoodRepository.create(data);
        const db = getDatabase();
        const id = `marked_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const createdAt = Date.now();

        await db.runAsync(
            'INSERT INTO user_marked_food (id, profileId, foodId, userVerdict, userNote, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
            [id, data.profileId, data.foodId, data.userVerdict, data.userNote, createdAt]
        );

        return id;
    },

    getByProfile: async (profileId: string): Promise<UserMarkedFood[]> => {
        if (Platform.OS === 'web') return WebUserMarkedFoodRepository.getByProfile(profileId);
        const db = getDatabase();
        return await db.getAllAsync(
            'SELECT * FROM user_marked_food WHERE profileId = ? ORDER BY createdAt DESC',
            [profileId]
        ) as UserMarkedFood[];
    },

    delete: async (id: string): Promise<void> => {
        if (Platform.OS === 'web') return WebUserMarkedFoodRepository.delete(id);
        const db = getDatabase();
        await db.runAsync('DELETE FROM user_marked_food WHERE id = ?', [id]);
    },
};

// Training Plan Repository
export const TrainingPlanRepository = {
    create: async (plan: Omit<TrainingPlan, 'id' | 'createdAt'>): Promise<string> => {
        if (Platform.OS === 'web') return WebTrainingPlanRepository.create(plan);
        const db = getDatabase();
        const id = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const createdAt = Date.now();

        await db.runAsync(
            'INSERT INTO training_plan (id, profileId, title, goal, sessionsPerWeek, sessionDuration, templateId, targetBehaviors, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                id,
                plan.profileId,
                plan.title,
                plan.goal,
                plan.sessionsPerWeek,
                plan.sessionDuration || null,
                plan.templateId || null,
                plan.targetBehaviors ? JSON.stringify(plan.targetBehaviors) : null,
                createdAt
            ]
        );

        return id;
    },

    getByProfile: async (profileId: string): Promise<TrainingPlan[]> => {
        if (Platform.OS === 'web') return WebTrainingPlanRepository.getByProfile(profileId);
        const db = getDatabase();
        const results = await db.getAllAsync(
            'SELECT * FROM training_plan WHERE profileId = ? ORDER BY createdAt DESC',
            [profileId]
        ) as any[];

        return results.map(row => ({
            ...row,
            targetBehaviors: row.targetBehaviors ? JSON.parse(row.targetBehaviors) : undefined
        })) as TrainingPlan[];
    },

    delete: async (id: string): Promise<void> => {
        if (Platform.OS === 'web') return WebTrainingPlanRepository.delete(id);
        const db = getDatabase();
        await db.runAsync('DELETE FROM training_plan WHERE id = ?', [id]);
    },

    update: async (id: string, updates: Partial<TrainingPlan>): Promise<void> => {
        if (Platform.OS === 'web') return WebTrainingPlanRepository.update(id, updates);
        const db = getDatabase();

        // Convert targetBehaviors to string if present
        const dbUpdates: any = { ...updates };
        if (dbUpdates.targetBehaviors) {
            dbUpdates.targetBehaviors = JSON.stringify(dbUpdates.targetBehaviors);
        }

        const keys = Object.keys(dbUpdates);
        const fields = keys.map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(dbUpdates), id];
        await db.runAsync(`UPDATE training_plan SET ${fields} WHERE id = ?`, values as any);
    }
};

// Training Session Log Repository
export const TrainingSessionRepository = {
    create: async (session: Omit<TrainingSessionLog, 'id'>): Promise<string> => {
        if (Platform.OS === 'web') return WebTrainingSessionRepository.create(session);
        const db = getDatabase();
        const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await db.runAsync(
            'INSERT INTO training_session_log (id, profileId, planId, date, minutes, activity, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, session.profileId, session.planId, session.date, session.minutes, session.activity, session.notes]
        );

        return id;
    },

    getByProfile: async (profileId: string): Promise<TrainingSessionLog[]> => {
        if (Platform.OS === 'web') return WebTrainingSessionRepository.getByProfile(profileId);
        const db = getDatabase();
        return await db.getAllAsync(
            'SELECT * FROM training_session_log WHERE profileId = ? ORDER BY date DESC',
            [profileId]
        ) as TrainingSessionLog[];
    },

    delete: async (id: string): Promise<void> => {
        if (Platform.OS === 'web') return WebTrainingSessionRepository.delete(id);
        const db = getDatabase();
        await db.runAsync('DELETE FROM training_session_log WHERE id = ?', [id]);
    },
};

// Diet Plan Repository
export const DietPlanRepository = {
    createOrUpdate: async (plan: Omit<DietPlan, 'id'>): Promise<string> => {
        if (Platform.OS === 'web') return WebDietPlanRepository.createOrUpdate(plan);
        const db = getDatabase();

        // Check if plan exists for this profile
        const existing = await db.getFirstAsync(
            'SELECT id FROM diet_plan WHERE profileId = ?',
            [plan.profileId]
        ) as { id: string } | null;

        if (existing) {
            await db.runAsync(
                'UPDATE diet_plan SET pelletsPercent = ?, veggiesPercent = ?, fruitsPercent = ?, seedsPercent = ?, notes = ? WHERE id = ?',
                [plan.pelletsPercent, plan.veggiesPercent, plan.fruitsPercent, plan.seedsPercent, plan.notes, existing.id]
            );
            return existing.id;
        } else {
            const id = `diet_${Date.now()}`;
            await db.runAsync(
                'INSERT INTO diet_plan (id, profileId, pelletsPercent, veggiesPercent, fruitsPercent, seedsPercent, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, plan.profileId, plan.pelletsPercent, plan.veggiesPercent, plan.fruitsPercent, plan.seedsPercent, plan.notes]
            );
            return id;
        }
    },

    getByProfile: async (profileId: string): Promise<DietPlan | null> => {
        if (Platform.OS === 'web') return WebDietPlanRepository.getByProfile(profileId);
        const db = getDatabase();
        return await db.getFirstAsync(
            'SELECT * FROM diet_plan WHERE profileId = ?',
            [profileId]
        ) as DietPlan | null;
    },
};

// Care Task Repository
export const CareTaskRepository = {
    create: async (task: Omit<CareTask, 'id' | 'isDone' | 'lastDoneAt'>): Promise<string> => {
        if (Platform.OS === 'web') return WebCareTaskRepository.create(task);
        const db = getDatabase();
        const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await db.runAsync(
            'INSERT INTO care_task (id, profileId, title, schedule, isDone, lastDoneAt, reminderTime, streak) VALUES (?, ?, ?, ?, 0, NULL, NULL, 0)',
            [id, task.profileId, task.title, task.schedule]
        );

        return id;
    },

    getByProfile: async (profileId: string): Promise<CareTask[]> => {
        if (Platform.OS === 'web') return WebCareTaskRepository.getByProfile(profileId);
        const db = getDatabase();
        return await db.getAllAsync(
            'SELECT * FROM care_task WHERE profileId = ? ORDER BY schedule, title',
            [profileId]
        ) as CareTask[];
    },

    toggleDone: async (id: string): Promise<void> => {
        if (Platform.OS === 'web') return WebCareTaskRepository.toggleDone(id);
        const db = getDatabase();
        const task = await db.getFirstAsync('SELECT * FROM care_task WHERE id = ?', [id]) as CareTask | null;

        if (task) {
            const newIsDone = task.isDone ? 0 : 1;
            const lastDoneAt = newIsDone ? Date.now() : null;

            // Calculate streak
            let streak = task.streak || 0;
            if (newIsDone && task.lastDoneAt) {
                const doneDate = new Date(task.lastDoneAt);
                const today = new Date();
                const isYesterday = (today.getDate() - doneDate.getDate() === 1) && (today.getMonth() === doneDate.getMonth());
                if (isYesterday) {
                    streak += 1;
                } else if (today.getDate() !== doneDate.getDate()) {
                    // Reset if missed a day (simplified logic, improves later)
                    streak = 1;
                }
            } else if (newIsDone) {
                streak = 1; // First time
            }

            await db.runAsync(
                'UPDATE care_task SET isDone = ?, lastDoneAt = ?, streak = ? WHERE id = ?',
                [newIsDone, lastDoneAt, streak, id]
            );
        }
    },

    delete: async (id: string): Promise<void> => {
        if (Platform.OS === 'web') return WebCareTaskRepository.delete(id);
        const db = getDatabase();
        await db.runAsync('DELETE FROM care_task WHERE id = ?', [id]);
    },

    update: async (id: string, updates: Partial<CareTask>): Promise<void> => {
        if (Platform.OS === 'web') return WebCareTaskRepository.update(id, updates);
        const db = getDatabase();
        // Construct query dynamically
        const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(updates), id];

        await db.runAsync(
            `UPDATE care_task SET ${fields} WHERE id = ?`,
            values
        );
    }
};

// Care Task History Repository
export const CareTaskHistoryRepository = {
    create: async (log: Omit<CareTaskHistory, 'id'>): Promise<string> => {
        if (Platform.OS === 'web') return WebCareTaskHistoryRepository.create(log);
        const db = getDatabase();
        const id = `history_${Date.now()}`;

        await db.runAsync(
            'INSERT INTO care_task_history (id, profileId, taskId, date, time, notes, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, log.profileId, log.taskId, log.date, log.time, log.notes || null, log.timestamp]
        );

        return id;
    },

    getByProfile: async (profileId: string): Promise<CareTaskHistory[]> => {
        if (Platform.OS === 'web') return WebCareTaskHistoryRepository.getByProfile(profileId);
        const db = getDatabase();
        return await db.getAllAsync(
            'SELECT * FROM care_task_history WHERE profileId = ? ORDER BY timestamp DESC',
            [profileId]
        ) as CareTaskHistory[];
    },

    getByTask: async (taskId: string): Promise<CareTaskHistory[]> => {
        if (Platform.OS === 'web') return WebCareTaskHistoryRepository.getByTask(taskId);
        const db = getDatabase();
        return await db.getAllAsync(
            'SELECT * FROM care_task_history WHERE taskId = ? ORDER BY timestamp DESC',
            [taskId]
        ) as CareTaskHistory[];
    },

    getByMonth: async (profileId: string, year: number, month: number): Promise<CareTaskHistory[]> => {
        if (Platform.OS === 'web') return WebCareTaskHistoryRepository.getByMonth(profileId, year, month);
        const db = getDatabase();
        // SQLite date string comparison
        const monthStr = `${year}-${String(month).padStart(2, '0')}%`;
        return await db.getAllAsync(
            'SELECT * FROM care_task_history WHERE profileId = ? AND date LIKE ? ORDER BY timestamp DESC',
            [profileId, monthStr]
        ) as CareTaskHistory[];
    }
};

// Diet Log Repository
export const DietLogRepository = {
    create: async (log: Omit<DietLog, 'id'>): Promise<string> => {
        if (Platform.OS === 'web') return WebDietLogRepository.create(log);
        const db = getDatabase();
        const id = `diet_log_${Date.now()}`;

        await db.runAsync(
            'INSERT INTO diet_log (id, profileId, date, items, notes) VALUES (?, ?, ?, ?, ?)',
            [id, log.profileId, log.date, JSON.stringify(log.items), log.notes]
        );

        return id;
    },

    getByProfile: async (profileId: string): Promise<DietLog[]> => {
        if (Platform.OS === 'web') return WebDietLogRepository.getByProfile(profileId);
        const db = getDatabase();
        const logs = await db.getAllAsync(
            'SELECT * FROM diet_log WHERE profileId = ? ORDER BY date DESC',
            [profileId]
        ) as any[];

        return logs.map(log => ({
            ...log,
            items: JSON.parse(log.items)
        }));
    },

    delete: async (id: string): Promise<void> => {
        if (Platform.OS === 'web') return WebDietLogRepository.delete(id);
        const db = getDatabase();
        await db.runAsync('DELETE FROM diet_log WHERE id = ?', [id]);
    }
};

// Shopping List Repository
export const ShoppingListRepository = {
    create: async (item: Omit<ShoppingListItem, 'id' | 'createdAt' | 'isChecked'>): Promise<string> => {
        if (Platform.OS === 'web') return WebShoppingListRepository.create(item);
        const db = getDatabase();
        const id = `shop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const createdAt = Date.now();

        await db.runAsync(
            'INSERT INTO shopping_list (id, profileId, text, category, isChecked, createdAt) VALUES (?, ?, ?, ?, 0, ?)',
            [id, item.profileId, item.text, item.category, createdAt]
        );

        return id;
    },

    getByProfile: async (profileId: string): Promise<ShoppingListItem[]> => {
        if (Platform.OS === 'web') return WebShoppingListRepository.getByProfile(profileId);
        const db = getDatabase();
        const items = await db.getAllAsync(
            'SELECT * FROM shopping_list WHERE profileId = ? ORDER BY createdAt DESC',
            [profileId]
        ) as any[];

        return items.map(item => ({
            ...item,
            isChecked: item.isChecked === 1
        }));
    },

    toggleCheck: async (id: string, isChecked: boolean): Promise<void> => {
        if (Platform.OS === 'web') return WebShoppingListRepository.toggleCheck(id, isChecked);
        const db = getDatabase();
        await db.runAsync(
            'UPDATE shopping_list SET isChecked = ? WHERE id = ?',
            [isChecked ? 1 : 0, id]
        );
    },

    delete: async (id: string): Promise<void> => {
        if (Platform.OS === 'web') return WebShoppingListRepository.delete(id);
        const db = getDatabase();
        await db.runAsync('DELETE FROM shopping_list WHERE id = ?', [id]);
    },

    clearChecked: async (profileId: string): Promise<void> => {
        if (Platform.OS === 'web') return WebShoppingListRepository.clearChecked(profileId);
        const db = getDatabase();
        await db.runAsync(
            'DELETE FROM shopping_list WHERE profileId = ? AND isChecked = 1',
            [profileId]
        );
    }
};
