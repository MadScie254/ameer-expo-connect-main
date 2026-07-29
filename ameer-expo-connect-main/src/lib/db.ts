import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

await db.execute(`
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
