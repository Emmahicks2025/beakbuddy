// Web compatible repository implementation using LocalStorage/Memory
import {
    Species, ParrotProfile, FoodItem, UserMarkedFood,
    TrainingPlan, TrainingSessionLog, DietPlan,
    CareTask, CareTaskHistory, FoodVerdict,
    SizeCategory, SensitivityTag, DietLog, ShoppingListItem
} from '../types';
import { speciesSeedData, foodSeedData } from './seedData';
import { StorageService } from '../services/StorageService';

// Constants for LocalStorage keys
const STORAGE_KEYS = {
    PROFILES: 'parrot_app_profiles',
    MARKED_FOOD: 'parrot_app_marked_food',
    TRAINING_PLANS: 'parrot_app_training_plans',
    SESSIONS: 'parrot_app_sessions',
    DIET_PLANS: 'parrot_app_diet_plans',
    CARE_TASKS: 'parrot_app_care_tasks',
    THEME: 'parrot_app_theme',
    TASK_HISTORY: 'parrot_app_task_history',
    DIET_LOGS: 'parrot_app_diet_logs',
    SHOPPING_LIST: 'parrot_app_shopping_list',
};

// Helper: Get data from storage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = StorageService.getItemSync ? StorageService.getItemSync(key) : null;
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
};

// Helper: Save data to storage
const saveToStorage = (key: string, data: any) => {
    try {
        if (StorageService.setItemSync) {
            StorageService.setItemSync(key, JSON.stringify(data));
        } else {
            StorageService.setItem(key, JSON.stringify(data));
        }
    } catch (e) {
        console.warn('Failed to save to storage', e);
    }
};

export const WebSpeciesRepository = {
    getAll: async (): Promise<Species[]> => {
        return speciesSeedData.map(s => ({
            ...s,
            id: s.commonName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        })) as Species[];
    },

    getById: async (id: string): Promise<Species | null> => {
        const all = await WebSpeciesRepository.getAll();
        return all.find(s => s.id === id) || null;
    },

    search: async (query: string): Promise<Species[]> => {
        const all = await WebSpeciesRepository.getAll();
        const lowerQuery = query.toLowerCase();
        return all.filter(s =>
            s.commonName.toLowerCase().includes(lowerQuery) ||
            s.scientificName.toLowerCase().includes(lowerQuery)
        );
    },

    filterBySize: async (size: SizeCategory): Promise<Species[]> => {
        const all = await WebSpeciesRepository.getAll();
        return all.filter(s => s.sizeCategory === size);
    },

    filterBySensitivity: async (sensitivity: SensitivityTag): Promise<Species[]> => {
        const all = await WebSpeciesRepository.getAll();
        return all.filter(s => s.sensitivityTag === sensitivity);
    },

    getPopular: async (limit: number): Promise<Species[]> => {
        const all = await WebSpeciesRepository.getAll();
        return all.sort((a, b) => a.popularityRank - b.popularityRank).slice(0, limit);
    }
};

export const WebProfileRepository = {
    create: async (profile: Omit<ParrotProfile, 'id' | 'createdAt'>): Promise<string> => {
        const profiles = getFromStorage<ParrotProfile[]>(STORAGE_KEYS.PROFILES, []);
        const id = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newProfile: ParrotProfile = {
            ...profile,
            id,
            createdAt: Date.now()
        };
        saveToStorage(STORAGE_KEYS.PROFILES, [newProfile, ...profiles]);
        return id;
    },

    getAll: async (): Promise<ParrotProfile[]> => {
        return getFromStorage<ParrotProfile[]>(STORAGE_KEYS.PROFILES, []);
    },

    getById: async (id: string): Promise<ParrotProfile | null> => {
        const profiles = await WebProfileRepository.getAll();
        return profiles.find(p => p.id === id) || null;
    },

    update: async (id: string, updates: Partial<ParrotProfile>): Promise<void> => {
        const profiles = await WebProfileRepository.getAll();
        const updated = profiles.map(p => p.id === id ? { ...p, ...updates } : p);
        saveToStorage(STORAGE_KEYS.PROFILES, updated);
    },

    delete: async (id: string): Promise<void> => {
        const profiles = await WebProfileRepository.getAll();
        const filtered = profiles.filter(p => p.id !== id);
        saveToStorage(STORAGE_KEYS.PROFILES, filtered);
    }
};

export const WebFoodRepository = {
    getAll: async (): Promise<FoodItem[]> => {
        return foodSeedData.map(f => ({
            ...f,
            id: f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        })) as FoodItem[];
    },

    getById: async (id: string): Promise<FoodItem | null> => {
        const all = await WebFoodRepository.getAll();
        return all.find(f => f.id === id) || null;
    },

    search: async (query: string): Promise<FoodItem[]> => {
        const all = await WebFoodRepository.getAll();
        const lower = query.toLowerCase();
        return all.filter(f =>
            f.name.toLowerCase().includes(lower) ||
            f.aliases.toLowerCase().includes(lower)
        );
    },

    getByVerdict: async (verdict: FoodVerdict): Promise<FoodItem[]> => {
        const all = await WebFoodRepository.getAll();
        return all.filter(f => f.verdict === verdict);
    }
};

export const WebUserMarkedFoodRepository = {
    create: async (data: Omit<UserMarkedFood, 'id' | 'createdAt'>): Promise<string> => {
        const items = getFromStorage<UserMarkedFood[]>(STORAGE_KEYS.MARKED_FOOD, []);
        const id = `marked_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newItem: UserMarkedFood = {
            ...data,
            id,
            createdAt: Date.now()
        };
        saveToStorage(STORAGE_KEYS.MARKED_FOOD, [newItem, ...items]);
        return id;
    },

    getByProfile: async (profileId: string): Promise<UserMarkedFood[]> => {
        const items = await WebUserMarkedFoodRepository.getAll();
        return items.filter(i => i.profileId === profileId);
    },

    getAll: async (): Promise<UserMarkedFood[]> => {
        return getFromStorage<UserMarkedFood[]>(STORAGE_KEYS.MARKED_FOOD, []);
    },

    delete: async (id: string): Promise<void> => {
        const items = await WebUserMarkedFoodRepository.getAll();
        const filtered = items.filter(i => i.id !== id);
        saveToStorage(STORAGE_KEYS.MARKED_FOOD, filtered);
    }
};

export const WebTrainingPlanRepository = {
    create: async (plan: Omit<TrainingPlan, 'id' | 'createdAt'>): Promise<string> => {
        const existing = getFromStorage<TrainingPlan[]>(STORAGE_KEYS.TRAINING_PLANS, []);
        const id = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newPlan: TrainingPlan = {
            ...plan,
            id,
            createdAt: Date.now()
        };
        saveToStorage(STORAGE_KEYS.TRAINING_PLANS, [newPlan, ...existing]);
        return id;
    },

    getByProfile: async (profileId: string): Promise<TrainingPlan[]> => {
        const all = getFromStorage<TrainingPlan[]>(STORAGE_KEYS.TRAINING_PLANS, []);
        return all.filter(p => p.profileId === profileId);
    },

    delete: async (id: string): Promise<void> => {
        const all = getFromStorage<TrainingPlan[]>(STORAGE_KEYS.TRAINING_PLANS, []);
        const filtered = all.filter(p => p.id !== id);
        saveToStorage(STORAGE_KEYS.TRAINING_PLANS, filtered);
    },

    update: async (id: string, updates: Partial<TrainingPlan>): Promise<void> => {
        const all = getFromStorage<TrainingPlan[]>(STORAGE_KEYS.TRAINING_PLANS, []);
        const index = all.findIndex(p => p.id === id);
        if (index >= 0) {
            all[index] = { ...all[index], ...updates };
            saveToStorage(STORAGE_KEYS.TRAINING_PLANS, all);
        }
    }
};

export const WebTrainingSessionRepository = {
    create: async (session: Omit<TrainingSessionLog, 'id'>): Promise<string> => {
        const existing = getFromStorage<TrainingSessionLog[]>(STORAGE_KEYS.SESSIONS, []);
        const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newSession: TrainingSessionLog = { ...session, id };
        saveToStorage(STORAGE_KEYS.SESSIONS, [newSession, ...existing]);
        return id;
    },

    getByProfile: async (profileId: string): Promise<TrainingSessionLog[]> => {
        const all = getFromStorage<TrainingSessionLog[]>(STORAGE_KEYS.SESSIONS, []);
        return all.filter(s => s.profileId === profileId);
    },

    delete: async (id: string): Promise<void> => {
        const all = getFromStorage<TrainingSessionLog[]>(STORAGE_KEYS.SESSIONS, []);
        const filtered = all.filter(s => s.id !== id);
        saveToStorage(STORAGE_KEYS.SESSIONS, filtered);
    }
};

export const WebDietPlanRepository = {
    createOrUpdate: async (plan: Omit<DietPlan, 'id'>): Promise<string> => {
        const all = getFromStorage<DietPlan[]>(STORAGE_KEYS.DIET_PLANS, []);
        const index = all.findIndex(p => p.profileId === plan.profileId);

        let id = index >= 0 ? all[index].id : `diet_${Date.now()}`;
        const newPlan: DietPlan = { ...plan, id };

        if (index >= 0) {
            all[index] = newPlan;
        } else {
            all.push(newPlan);
        }
        saveToStorage(STORAGE_KEYS.DIET_PLANS, all);
        return id;
    },

    getByProfile: async (profileId: string): Promise<DietPlan | null> => {
        const all = getFromStorage<DietPlan[]>(STORAGE_KEYS.DIET_PLANS, []);
        return all.find(p => p.profileId === profileId) || null;
    }
};

export const WebCareTaskRepository = {
    create: async (task: Omit<CareTask, 'id' | 'isDone' | 'lastDoneAt'>): Promise<string> => {
        const all = getFromStorage<CareTask[]>(STORAGE_KEYS.CARE_TASKS, []);
        const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newTask: CareTask = { ...task, id, isDone: 0, lastDoneAt: 0, reminderTime: task.reminderTime, streak: 0 };
        saveToStorage(STORAGE_KEYS.CARE_TASKS, [...all, newTask]);
        return id;
    },

    getByProfile: async (profileId: string): Promise<CareTask[]> => {
        const all = getFromStorage<CareTask[]>(STORAGE_KEYS.CARE_TASKS, []);
        return all.filter(t => t.profileId === profileId);
    },

    toggleDone: async (id: string): Promise<void> => {
        const all = getFromStorage<CareTask[]>(STORAGE_KEYS.CARE_TASKS, []);
        const updated = all.map(t => {
            if (t.id === id) {
                const isDone = t.isDone ? 0 : 1;
                return { ...t, isDone, lastDoneAt: isDone ? Date.now() : 0 };
            }
            return t;
        });
        saveToStorage(STORAGE_KEYS.CARE_TASKS, updated);
    },

    delete: async (id: string): Promise<void> => {
        const all = getFromStorage<CareTask[]>(STORAGE_KEYS.CARE_TASKS, []);
        const filtered = all.filter(t => t.id !== id);
        saveToStorage(STORAGE_KEYS.CARE_TASKS, filtered);
    },

    update: async (id: string, updates: Partial<CareTask>): Promise<void> => {
        const all = getFromStorage<CareTask[]>(STORAGE_KEYS.CARE_TASKS, []);
        const updated = all.map(t => t.id === id ? { ...t, ...updates } : t);
        saveToStorage(STORAGE_KEYS.CARE_TASKS, updated);
    }
};

export const WebCareTaskHistoryRepository = {
    create: async (log: Omit<CareTaskHistory, 'id'>): Promise<string> => {
        const all = getFromStorage<CareTaskHistory[]>(STORAGE_KEYS.TASK_HISTORY, []);
        const id = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newLog = { ...log, id };
        saveToStorage(STORAGE_KEYS.TASK_HISTORY, [...all, newLog]);
        return id;
    },

    getByProfile: async (profileId: string): Promise<CareTaskHistory[]> => {
        const all = getFromStorage<CareTaskHistory[]>(STORAGE_KEYS.TASK_HISTORY, []);
        return all.filter(h => h.profileId === profileId);
    },

    getByTask: async (taskId: string): Promise<CareTaskHistory[]> => {
        const all = getFromStorage<CareTaskHistory[]>(STORAGE_KEYS.TASK_HISTORY, []);
        return all.filter(h => h.taskId === taskId).sort((a, b) => b.timestamp - a.timestamp);
    },

    getByMonth: async (profileId: string, year: number, month: number): Promise<CareTaskHistory[]> => {
        const all = getFromStorage<CareTaskHistory[]>(STORAGE_KEYS.TASK_HISTORY, []);
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        return all.filter(h => h.profileId === profileId && h.date.startsWith(monthStr));
    }
};

export const WebDietLogRepository = {
    create: async (log: Omit<DietLog, 'id'>): Promise<string> => {
        const all = getFromStorage<DietLog[]>(STORAGE_KEYS.DIET_LOGS, []);
        const id = `diet_log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newLog = { ...log, id };
        saveToStorage(STORAGE_KEYS.DIET_LOGS, [...all, newLog]);
        return id;
    },

    getByProfile: async (profileId: string): Promise<DietLog[]> => {
        const all = getFromStorage<DietLog[]>(STORAGE_KEYS.DIET_LOGS, []);
        return all.filter(l => l.profileId === profileId).sort((a, b) => b.date - a.date);
    },

    delete: async (id: string): Promise<void> => {
        const all = getFromStorage<DietLog[]>(STORAGE_KEYS.DIET_LOGS, []);
        const filtered = all.filter(l => l.id !== id);
        saveToStorage(STORAGE_KEYS.DIET_LOGS, filtered);
    }
};

export const WebShoppingListRepository = {
    create: async (item: Omit<ShoppingListItem, 'id' | 'createdAt' | 'isChecked'>): Promise<string> => {
        const all = getFromStorage<ShoppingListItem[]>(STORAGE_KEYS.SHOPPING_LIST, []);
        const id = `shop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newItem: ShoppingListItem = {
            ...item,
            id,
            isChecked: 0,
            createdAt: Date.now()
        };
        saveToStorage(STORAGE_KEYS.SHOPPING_LIST, [...all, newItem]);
        return id;
    },

    getByProfile: async (profileId: string): Promise<ShoppingListItem[]> => {
        const all = getFromStorage<ShoppingListItem[]>(STORAGE_KEYS.SHOPPING_LIST, []);
        return all.filter(i => i.profileId === profileId).sort((a, b) => b.createdAt - a.createdAt);
    },

    toggleCheck: async (id: string, isChecked: boolean): Promise<void> => {
        const all = getFromStorage<ShoppingListItem[]>(STORAGE_KEYS.SHOPPING_LIST, []);
        const updated = all.map(i => i.id === id ? { ...i, isChecked: isChecked ? 1 : 0 } : i);
        saveToStorage(STORAGE_KEYS.SHOPPING_LIST, updated);
    },

    delete: async (id: string): Promise<void> => {
        const all = getFromStorage<ShoppingListItem[]>(STORAGE_KEYS.SHOPPING_LIST, []);
        const filtered = all.filter(i => i.id !== id);
        saveToStorage(STORAGE_KEYS.SHOPPING_LIST, filtered);
    },

    clearChecked: async (profileId: string): Promise<void> => {
        const all = getFromStorage<ShoppingListItem[]>(STORAGE_KEYS.SHOPPING_LIST, []);
        const filtered = all.filter(i => i.profileId !== profileId || i.isChecked === 0);
        saveToStorage(STORAGE_KEYS.SHOPPING_LIST, filtered);
    }
};
