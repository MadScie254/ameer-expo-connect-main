import Database from "better-sqlite3";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

// Ensure data directory exists
const dataDir = join(process.cwd(), "data");
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, "ameer_expo.sqlite");
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    jobTitle TEXT,
    passType TEXT NOT NULL DEFAULT 'general',
    amount NUMERIC DEFAULT 0,
    paymentStatus TEXT DEFAULT 'free',
    orderTrackingId TEXT,
    payload TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
