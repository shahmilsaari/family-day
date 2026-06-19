import Database from "better-sqlite3";
import path from "node:path";

const dbPath = path.resolve(process.cwd(), "dev.db");
const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS family_day_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    year INTEGER NOT NULL UNIQUE,
    tentativeDate DATETIME,
    location TEXT,
    startDate DATETIME,
    endDate DATETIME,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
const existingCols = db.prepare(`PRAGMA table_info(family_day_events)`).all().map(c => c.name);

if (!existingCols.includes("location")) {
  db.exec(`ALTER TABLE family_day_events ADD COLUMN location TEXT;`);
}
if (!existingCols.includes("startDate")) {
  db.exec(`ALTER TABLE family_day_events ADD COLUMN startDate DATETIME;`);
  // Migrate existing tentativeDate values into startDate
  db.exec(`UPDATE family_day_events SET startDate = tentativeDate WHERE tentativeDate IS NOT NULL AND startDate IS NULL;`);
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
