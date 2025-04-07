import { users, type User, type InsertUser, contents, type Content, type InsertContent } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import pg from "pg";

// Create session store
const PostgresSessionStore = connectPg(session);
// Use any for session store type to avoid TypeScript complexities
type SessionStoreType = any;

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Content operations
  getContent(id: number): Promise<Content | undefined>;
  createContent(content: InsertContent): Promise<Content>;
  getUserContents(userId: number): Promise<Content[]>;
  getUserContentsByType(userId: number, contentType: string): Promise<Content[]>;
  getRecentUserContents(userId: number, limit?: number): Promise<Content[]>;
  
  // Session store
  sessionStore: SessionStoreType;
}

export class DatabaseStorage implements IStorage {
  sessionStore: SessionStoreType;

  constructor() {
    // Create a PostgreSQL connection pool for session store
    const pgPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    // Create a PostgreSQL session store
    this.sessionStore = new PostgresSessionStore({
      pool: pgPool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    // Exclude sensitive fields from update
    const { password, ...safeUserData } = userData;
    
    // Update user data
    const [updatedUser] = await db
      .update(users)
      .set(safeUserData)
      .where(eq(users.id, id))
      .returning();
      
    return updatedUser;
  }

  // Content operations
  async getContent(id: number): Promise<Content | undefined> {
    const [content] = await db.select().from(contents).where(eq(contents.id, id));
    return content || undefined;
  }

  async createContent(content: InsertContent): Promise<Content> {
    const [newContent] = await db
      .insert(contents)
      .values(content)
      .returning();
    return newContent;
  }

  async getUserContents(userId: number): Promise<Content[]> {
    return await db
      .select()
      .from(contents)
      .where(eq(contents.userId, userId))
      .orderBy(desc(contents.createdAt));
  }

  async getUserContentsByType(userId: number, contentType: string): Promise<Content[]> {
    return await db
      .select()
      .from(contents)
      .where(and(
        eq(contents.userId, userId),
        eq(contents.contentType, contentType)
      ))
      .orderBy(desc(contents.createdAt));
  }

  async getRecentUserContents(userId: number, limit: number = 10): Promise<Content[]> {
    return await db
      .select()
      .from(contents)
      .where(eq(contents.userId, userId))
      .orderBy(desc(contents.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
