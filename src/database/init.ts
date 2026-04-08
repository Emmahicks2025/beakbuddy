import { createTablesSQL, createIndexesSQL, DB_NAME, DB_VERSION } from './schema';
import { speciesSeedData, foodSeedData } from './seedData';
import { Platform } from 'react-native';

let SQLite: any = null;
if (Platform.OS !== 'web') {
    SQLite = require('expo-sqlite');
}

let db: any = null;
let initPromise: Promise<any> | null = null;

export const initDatabase = async (): Promise<any> => {
    if (db) return db;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            console.log('DB: Opening database:', DB_NAME);
            db = await SQLite.openDatabaseAsync(DB_NAME);

            // STABILITY FIX: Enable Write-Ahead Logging (WAL) for better concurrency and stability
            console.log('DB: Enabling WAL mode...');
            await db.execAsync('PRAGMA journal_mode = WAL;');
            const walResult = await db.getFirstAsync('PRAGMA journal_mode;');
            console.log('DB: Journal mode is now:', walResult?.journal_mode);

            // Self-Healing: Verify tables exist regardless of version metadata
            // This fixes the issue where app thinks it is v4 but tables are missing
            await verifyAndFixTables(db);

            let metadata: { value: string } | null = null;
            try {
                // Check if database is already initialized
                metadata = await db.getFirstAsync(
                    'SELECT value FROM app_metadata WHERE key = ?',
                    ['db_version']
                );
            } catch (e) {
                // Table doesn't exist yet, which is expected on first run
                console.log('DB: app_metadata table not found, assuming first-time setup');
            }

            if (!metadata) {
                // First time setup
                await setupDatabase(db);
            } else {
                const currentVersion = parseInt(metadata.value);
                console.log('DB: Current version:', currentVersion, 'Expected:', DB_VERSION);
                if (currentVersion < DB_VERSION) {
                    await migrateDatabase(db, currentVersion, DB_VERSION);
                }
            }

            console.log('DB: Initialization complete');
            return db;
        } catch (error) {
            console.error('DB: Initialization failed:', error);
            initPromise = null; // Allow retrying
            throw error;
        }
    })();

    return initPromise;
};

const verifyAndFixTables = async (database: any) => {
    console.log('Running self-healing table verification...');
    try {
        const result = await database.getAllAsync(
            "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('shopping_list', 'diet_log', 'parrot_profile', 'species', 'food_item', 'training_plan')"
        );

        const existingTables = result.map((r: any) => r.name);
        const criticalTables = ['shopping_list', 'diet_log', 'parrot_profile', 'species', 'food_item', 'training_plan'];

        const missingTables = criticalTables.filter(t => !existingTables.includes(t));

        if (missingTables.length > 0) {
            console.warn(`Self-healing: Missing tables detected: ${missingTables.join(', ')}. Fixing...`);
            await database.execAsync(createTablesSQL);
        } else {
            console.log('Self-healing: All critical tables are present.');
        }
    } catch (e) {
        console.error('Self-healing check failed:', e);
    }
};

const setupDatabase = async (database: any) => {
    console.log('Setting up database for first time...');

    await database.execAsync(createTablesSQL);
    await database.execAsync(createIndexesSQL);

    // Seed data using a transaction for speed and safety
    await database.withTransactionAsync(async () => {
        console.log('Seeding species data...');
        for (const species of speciesSeedData) {
            const id = species.commonName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            await database.runAsync(
                `INSERT OR REPLACE INTO species (id, commonName, scientificName, popularityRank, sizeCategory, sensitivityTag, imageAsset)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id, species.commonName, species.scientificName, species.popularityRank,
                    species.sizeCategory, species.sensitivityTag, species.imageAsset]
            );
        }

        console.log('Seeding food data...');
        for (const food of foodSeedData) {
            const id = food.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            await database.runAsync(
                `INSERT OR REPLACE INTO food_item (id, name, aliases, verdict, confidence, notes, symptoms, servingTips, sourceNote)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, food.name, food.aliases, food.verdict, food.confidence,
                    food.notes, food.symptoms, food.servingTips, food.sourceNote]
            );
        }

        // Set database version
        await database.runAsync(
            'INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)',
            ['db_version', DB_VERSION.toString()]
        );
    });

    console.log('Database setup complete!');
};

const migrateDatabase = async (
    database: any,
    fromVersion: number,
    toVersion: number
) => {
    console.log(`Migrating database from v${fromVersion} to v${toVersion}...`);

    if (fromVersion < 2) {
        console.log('Migrating to v2: Adding new columns to training_plan...');
        try {
            await database.execAsync(`
                ALTER TABLE training_plan ADD COLUMN sessionDuration INTEGER;
                ALTER TABLE training_plan ADD COLUMN targetBehaviors TEXT;
            `);
        } catch (e) {
            console.warn('Migration to v2 columns might have already happened or failed', e);
        }
    }

    if (fromVersion < 3) {
        console.log('Migrating to v3: Adding templateId to training_plan...');
        try {
            await database.execAsync(`
                ALTER TABLE training_plan ADD COLUMN templateId TEXT;
            `);
        } catch (e) {
            console.warn('Migration to v3 column might have already happened or failed', e);
        }
    }

    if (fromVersion < 4) {
        console.log('Migrating to v4: Adding diet_log and shopping_list tables...');
        try {
            await database.execAsync(`
                CREATE TABLE IF NOT EXISTS diet_log (
                  id TEXT PRIMARY KEY,
                  profileId TEXT NOT NULL,
                  date INTEGER NOT NULL,
                  items TEXT NOT NULL,
                  notes TEXT,
                  FOREIGN KEY (profileId) REFERENCES parrot_profile(id)
                );
                CREATE TABLE IF NOT EXISTS shopping_list (
                  id TEXT PRIMARY KEY,
                  profileId TEXT NOT NULL,
                  text TEXT NOT NULL,
                  category TEXT NOT NULL,
                  isChecked INTEGER NOT NULL DEFAULT 0,
                  createdAt INTEGER NOT NULL,
                  FOREIGN KEY (profileId) REFERENCES parrot_profile(id)
                );
            `);
        } catch (e) {
            console.warn('Migration to v4 tables might have already happened or failed', e);
        }
    }

    if (fromVersion < 5) {
        console.log('Migrating to v5: Refreshing species and food data...');
        // We re-run seeding logic to pick up new food data and corrected species names
        await database.withTransactionAsync(async () => {
            for (const species of speciesSeedData) {
                const id = species.commonName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                await database.runAsync(
                    `INSERT OR REPLACE INTO species (id, commonName, scientificName, popularityRank, sizeCategory, sensitivityTag, imageAsset)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [id, species.commonName, species.scientificName, species.popularityRank,
                        species.sizeCategory, species.sensitivityTag, species.imageAsset]
                );
            }

            for (const food of foodSeedData) {
                const id = food.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                await database.runAsync(
                    `INSERT OR REPLACE INTO food_item (id, name, aliases, verdict, confidence, notes, symptoms, servingTips, sourceNote)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [id, food.name, food.aliases, food.verdict, food.confidence,
                        food.notes, food.symptoms, food.servingTips, food.sourceNote]
                );
            }
        });
    }

    if (fromVersion < 6) {
        console.log('Migrating to v6: Adding reminderTime and streak to care_task...');
        try {
            await database.execAsync(`
                ALTER TABLE care_task ADD COLUMN reminderTime TEXT;
                ALTER TABLE care_task ADD COLUMN streak INTEGER DEFAULT 0;
            `);
        } catch (e) {
            console.warn('Migration to v6 columns might have already happened or failed', e);
        }
    }

    // Update version
    await database.runAsync(
        'UPDATE app_metadata SET value = ? WHERE key = ?',
        [toVersion.toString(), 'db_version']
    );

    console.log('Migration complete!');
};

export const getDatabase = (): any => {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
};

export const closeDatabase = async () => {
    if (db) {
        await db.closeAsync();
        db = null;
    }
};
