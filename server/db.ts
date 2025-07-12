import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { Pool } from "pg";
import * as schema from "@shared/schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Check your Supabase project settings.");
}

// ✅ Drizzle DB client using postgres-js
const client = postgres(DATABASE_URL, {
  ssl: 'require',
});

export const db = drizzle(client, { schema });

// ✅ pg Pool for session store compatibility with connect-pg-simple
export const sessionPool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
