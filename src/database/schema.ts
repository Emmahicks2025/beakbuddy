// SQLite database schema for BeakBuddy

export const DB_NAME = 'parrot_master.db';
export const DB_VERSION = 5;

export const createTablesSQL = `
-- Species table
CREATE TABLE IF NOT EXISTS species (
  id TEXT PRIMARY KEY,
  commonName TEXT NOT NULL,
  scientificName TEXT NOT NULL,
  popularityRank INTEGER NOT NULL,
  sizeCategory TEXT NOT NULL,
  sensitivityTag TEXT NOT NULL,
  imageAsset TEXT NOT NULL
);

-- Parrot profiles
CREATE TABLE IF NOT EXISTS parrot_profile (
  id TEXT PRIMARY KEY,
  displayName TEXT NOT NULL,
  speciesId TEXT NOT NULL,
  avatarAsset TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (speciesId) REFERENCES species(id)
);

-- Food items
CREATE TABLE IF NOT EXISTS food_item (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  aliases TEXT,
  verdict TEXT NOT NULL,
  confidence REAL NOT NULL,
  notes TEXT,
  symptoms TEXT,
  servingTips TEXT,
  sourceNote TEXT
);

-- User marked food
CREATE TABLE IF NOT EXISTS user_marked_food (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  foodId TEXT NOT NULL,
  userVerdict TEXT NOT NULL,
  userNote TEXT,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (profileId) REFERENCES parrot_profile(id),
  FOREIGN KEY (foodId) REFERENCES food_item(id)
);

-- Training plans
CREATE TABLE IF NOT EXISTS training_plan (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  title TEXT NOT NULL,
  goal TEXT NOT NULL,
  sessionsPerWeek INTEGER NOT NULL,
  sessionDuration INTEGER,
  templateId TEXT,
  targetBehaviors TEXT,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (profileId) REFERENCES parrot_profile(id)
);

-- Training session logs
CREATE TABLE IF NOT EXISTS training_session_log (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  planId TEXT,
  date INTEGER NOT NULL,
  minutes INTEGER NOT NULL,
  activity TEXT NOT NULL,
  notes TEXT,
  FOREIGN KEY (profileId) REFERENCES parrot_profile(id),
  FOREIGN KEY (planId) REFERENCES training_plan(id)
);

-- Diet plans
CREATE TABLE IF NOT EXISTS diet_plan (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  pelletsPercent INTEGER NOT NULL,
  veggiesPercent INTEGER NOT NULL,
  fruitsPercent INTEGER NOT NULL,
  seedsPercent INTEGER NOT NULL,
  notes TEXT,
  FOREIGN KEY (profileId) REFERENCES parrot_profile(id)
);

-- Care tasks
CREATE TABLE IF NOT EXISTS care_task (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  title TEXT NOT NULL,
  schedule TEXT NOT NULL,
  isDone INTEGER NOT NULL DEFAULT 0,
  lastDoneAt INTEGER,
  FOREIGN KEY (profileId) REFERENCES parrot_profile(id)
);

-- App metadata
CREATE TABLE IF NOT EXISTS app_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Care Task History
CREATE TABLE IF NOT EXISTS care_task_history (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  taskId TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  notes TEXT,
  timestamp INTEGER NOT NULL,
  FOREIGN KEY (profileId) REFERENCES parrot_profile(id),
  FOREIGN KEY (taskId) REFERENCES care_task(id)
);

-- Diet Logs
CREATE TABLE IF NOT EXISTS diet_log (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  date INTEGER NOT NULL,
  items TEXT NOT NULL,
  notes TEXT,
  FOREIGN KEY (profileId) REFERENCES parrot_profile(id)
);

-- Shopping List
CREATE TABLE IF NOT EXISTS shopping_list (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  text TEXT NOT NULL,
  category TEXT NOT NULL,
  isChecked INTEGER NOT NULL DEFAULT 0,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (profileId) REFERENCES parrot_profile(id)
);
`;

export const createIndexesSQL = `
CREATE INDEX IF NOT EXISTS idx_species_rank ON species(popularityRank);
CREATE INDEX IF NOT EXISTS idx_species_size ON species(sizeCategory);
CREATE INDEX IF NOT EXISTS idx_food_verdict ON food_item(verdict);
CREATE INDEX IF NOT EXISTS idx_profile_species ON parrot_profile(speciesId);
CREATE INDEX IF NOT EXISTS idx_user_food_profile ON user_marked_food(profileId);
CREATE INDEX IF NOT EXISTS idx_training_profile ON training_plan(profileId);
CREATE INDEX IF NOT EXISTS idx_session_profile ON training_session_log(profileId);
CREATE INDEX IF NOT EXISTS idx_diet_profile ON diet_plan(profileId);
CREATE INDEX IF NOT EXISTS idx_task_profile ON care_task(profileId);
CREATE INDEX IF NOT EXISTS idx_history_task ON care_task_history(taskId);
`;
