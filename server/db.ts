import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Create a Postgres.js client for Supabase
const queryClient = postgres(process.env.DATABASE_URL, { 
  max: 10, 
  ssl: 'require',
  prepare: false,
});

// Create a Drizzle client
export const db = drizzle(queryClient, { schema });
