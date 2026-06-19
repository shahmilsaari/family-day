import Database from "better-sqlite3";
import path from "node:path";

const dbPath = path.resolve(process.cwd(), "dev.db");
const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    tokenHash TEXT NOT NULL UNIQUE,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS family_day_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    tentativeDate DATETIME,
    location TEXT,
    startDate DATETIME,
    endDate DATETIME,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (userId, year)
  );

  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId INTEGER NOT NULL,
    name TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (eventId) REFERENCES family_day_events(id) ON DELETE CASCADE,
    UNIQUE (eventId, name)
  );

  CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teamId INTEGER NOT NULL,
    name TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId INTEGER NOT NULL,
    name TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (eventId) REFERENCES family_day_events(id) ON DELETE CASCADE,
    UNIQUE (eventId, name)
  );

  CREATE TABLE IF NOT EXISTS tentative_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId INTEGER NOT NULL,
    scheduleDate DATETIME,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    pic TEXT,
    location TEXT,
    notes TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (eventId) REFERENCES family_day_events(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventId INTEGER NOT NULL,
    teamId INTEGER NOT NULL,
    gameId INTEGER NOT NULL,
    points INTEGER NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (eventId) REFERENCES family_day_events(id) ON DELETE CASCADE,
    FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE,
    UNIQUE (teamId, gameId)
  );
`);

// Safe idempotent migrations for existing databases
const fallbackPassword = "legacy:imported";
db.prepare(`
  INSERT OR IGNORE INTO users (id, name, email, passwordHash)
  VALUES (1, 'Legacy Organizer', 'legacy@example.com', ?)
`).run(fallbackPassword);

let existingCols = db.prepare(`PRAGMA table_info(family_day_events)`).all().map(c => c.name);

if (!existingCols.includes("userId")) {
  db.exec(`ALTER TABLE family_day_events ADD COLUMN userId INTEGER NOT NULL DEFAULT 1;`);
}

const eventIndexes = db.prepare(`PRAGMA index_list(family_day_events)`).all();
const hasGlobalYearUnique = eventIndexes.some(index => index.unique && String(index.name).includes("year") && !String(index.name).includes("userId"));
const needsEventRebuild = hasGlobalYearUnique || !eventIndexes.some(index => index.unique && String(index.name).includes("userId"));

if (needsEventRebuild) {
  const tentativeDateSelect = existingCols.includes("tentativeDate") ? "tentativeDate" : "NULL";
  const locationSelect = existingCols.includes("location") ? "location" : "NULL";
  const startDateSelect = existingCols.includes("startDate") ? "startDate" : tentativeDateSelect;
  const endDateSelect = existingCols.includes("endDate") ? "endDate" : "NULL";

  db.exec(`
    PRAGMA foreign_keys = OFF;
    DROP TABLE IF EXISTS family_day_events_new;

    CREATE TABLE family_day_events_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL DEFAULT 1,
      title TEXT NOT NULL,
      year INTEGER NOT NULL,
      location TEXT,
      startDate DATETIME,
      endDate DATETIME,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (userId, year)
    );

    INSERT OR IGNORE INTO family_day_events_new (id, userId, title, year, location, startDate, endDate, createdAt, updatedAt)
    SELECT id, COALESCE(userId, 1), title, year, ${locationSelect}, ${startDateSelect}, ${endDateSelect}, createdAt, updatedAt
    FROM family_day_events;

    DROP TABLE family_day_events;
    ALTER TABLE family_day_events_new RENAME TO family_day_events;

    PRAGMA foreign_keys = ON;
  `);

  existingCols = db.prepare(`PRAGMA table_info(family_day_events)`).all().map(c => c.name);
}

if (!existingCols.includes("location")) {
  db.exec(`ALTER TABLE family_day_events ADD COLUMN location TEXT;`);
}
if (!existingCols.includes("startDate")) {
  db.exec(`ALTER TABLE family_day_events ADD COLUMN startDate DATETIME;`);
  // Migrate older tentativeDate values into startDate when that legacy column exists.
  if (existingCols.includes("tentativeDate")) {
    db.exec(`UPDATE family_day_events SET startDate = tentativeDate WHERE tentativeDate IS NOT NULL AND startDate IS NULL;`);
  }
}
if (!existingCols.includes("endDate")) {
  db.exec(`ALTER TABLE family_day_events ADD COLUMN endDate DATETIME;`);
}

const existingScheduleCols = db.prepare(`PRAGMA table_info(tentative_schedules)`).all().map(c => c.name);

if (!existingScheduleCols.includes("scheduleDate")) {
  db.exec(`ALTER TABLE tentative_schedules ADD COLUMN scheduleDate DATETIME;`);
}
if (!existingScheduleCols.includes("pic")) {
  db.exec(`ALTER TABLE tentative_schedules ADD COLUMN pic TEXT;`);
}

db.close();
