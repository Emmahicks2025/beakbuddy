// Web compatible init (no-op)
// This file is resolved automatically by Metro/Webpack when targeting web (.web.ts extension)

export const initDatabase = async (): Promise<any> => {
    // On web, we don't use SQLite. We use LocalStorage via webRepository.ts
    // Return null or a mock if needed, but the main point is to avoid importing expo-sqlite
    return null;
};

export const getDatabase = (): any => {
    // This should not be reachable if repository.ts correctly checks Platform.OS === 'web'
    // before calling getDatabase().
    throw new Error("getDatabase should not be called on web. Use WebRepository instead.");
};

export const closeDatabase = async () => {
    // no-op
};
