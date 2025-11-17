import { boolean, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const chatTypeEnum = pgEnum("chat_type", ["private", "group", "channel"]);

export const messageTypeEnum = pgEnum("message_type", ["text", "image", "voice", "video", "file"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  phone: text("phone").notNull().unique(),
  name: text("name"),
  avatar: text("avatar"),
  status: text("status"),
  gdprConsent: boolean("gdpr_consent").default(false),
  gdprConsentDate: timestamp("gdpr_consent_date"),
  dataProcessingConsent: boolean("data_processing_consent").default(false),
  marketingConsent: boolean("marketing_consent").default(false),
  fz152Consent: boolean("fz152_consent").default(false),
  fz152ConsentDate: timestamp("fz152_consent_date"),
  ccpaOptOut: boolean("ccpa_opt_out").default(false),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chats = pgTable("chats", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: chatTypeEnum("type").notNull(),
  name: text("name"),
  avatar: text("avatar"),
  lastMessage: text("last_message"),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMembers = pgTable("chat_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatId: uuid("chat_id").references(() => chats.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: text("role").default("member"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatId: uuid("chat_id").references(() => chats.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  type: messageTypeEnum("type").default("text").notNull(),
  metadata: jsonb("metadata"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messageReactions = pgTable("message_reactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  messageId: uuid("message_id").references(() => messages.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const annaConversations = pgTable("anna_conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  messages: jsonb("messages").notNull().default("[]"),
  mode: text("mode").default("normal").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

