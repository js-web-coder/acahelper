import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  profileImage: text("profile_image"),
  theme: text("theme").default("light"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
  profileImage: true,
  theme: true,
});

// Content table
export const contentTypes = ["expand", "summarize", "similar", "template"] as const;

export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  originalContent: text("original_content").notNull(),
  transformedContent: text("transformed_content").notNull(),
  contentType: text("content_type").notNull(),
  originalWordCount: integer("original_word_count").notNull(),
  transformedWordCount: integer("transformed_word_count").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  metadata: text("metadata"), // Store JSON as text for tone, audience, etc.
});

export const insertContentSchema = createInsertSchema(contents).pick({
  userId: true,
  title: true,
  originalContent: true,
  transformedContent: true,
  contentType: true,
  originalWordCount: true,
  transformedWordCount: true,
  metadata: true,
});

// AI Parameters schema
export const aiParametersSchema = z.object({
  temperature: z.number().min(0).max(1).default(0.7),
  topP: z.number().min(0).max(1).default(0.8),
  topK: z.number().min(1).max(100).default(40),
  maxOutputTokens: z.number().min(50).max(8192).default(2048),
});

// Content validation schema with Zod
export const contentTypeSchema = z.enum(contentTypes);

export const contentValidationSchema = z.object({
  text: z.string().min(1, "Content is required"),
  contentType: contentTypeSchema,
  tone: z.string().optional(),
  audience: z.string().optional(),
  aiParameters: aiParametersSchema.optional(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  contents: many(contents),
}));

export const contentsRelations = relations(contents, ({ one }) => ({
  user: one(users, {
    fields: [contents.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Content = typeof contents.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type ContentType = z.infer<typeof contentTypeSchema>;
export type ContentValidation = z.infer<typeof contentValidationSchema>;
export type AIParameters = z.infer<typeof aiParametersSchema>;
