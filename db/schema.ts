import { AnyPgColumn, boolean, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const chatTypeEnum = pgEnum("chat_type", ["private", "group", "channel"]);

export const messageTypeEnum = pgEnum("message_type", ["text", "image", "voice", "video", "file"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  phone: text("phone").notNull().unique(),
  name: text("name"),
  avatar: text("avatar"),
  status: text("status"),
  onlineStatus: text("online_status").default("offline"),
  lastSeen: timestamp("last_seen"),
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
  isArchived: boolean("is_archived").default(false),
  deletedAt: timestamp("deleted_at"),
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
  replyToId: uuid("reply_to_id").references((): AnyPgColumn => messages.id, { onDelete: "set null" }),
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

export const favoriteTypeEnum = pgEnum("favorite_type", ["message", "media", "link"]);

export const favorites = pgTable("favorites", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: favoriteTypeEnum("type").notNull(),
  messageId: uuid("message_id").references(() => messages.id, { onDelete: "cascade" }),
  chatId: uuid("chat_id").references(() => chats.id, { onDelete: "cascade" }),
  content: text("content"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pinnedChats = pgTable("pinned_chats", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  chatId: uuid("chat_id").references(() => chats.id, { onDelete: "cascade" }).notNull(),
  order: text("order").default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stories = pgTable("stories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  mediaUri: text("media_uri").notNull(),
  mediaType: text("media_type").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  viewsCount: text("views_count").default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const storyViews = pgTable("story_views", {
  id: uuid("id").defaultRandom().primaryKey(),
  storyId: uuid("story_id").references(() => stories.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

export const callTypeEnum = pgEnum("call_type", ["voice", "video"]);
export const callStatusEnum = pgEnum("call_status", ["missed", "incoming", "outgoing"]);

export const calls = pgTable("calls", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  chatId: uuid("chat_id").references(() => chats.id, { onDelete: "cascade" }),
  otherUserId: uuid("other_user_id").references(() => users.id, { onDelete: "cascade" }),
  type: callTypeEnum("type").notNull(),
  status: callStatusEnum("status").notNull(),
  duration: text("duration"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  contactUserId: uuid("contact_user_id").references(() => users.id, { onDelete: "cascade" }),
  phone: text("phone"),
  name: text("name"),
  avatar: text("avatar"),
  syncedFromDevice: boolean("synced_from_device").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userSessions = pgTable("user_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  deviceName: text("device_name").notNull(),
  deviceType: text("device_type").notNull(),
  ipAddress: text("ip_address"),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

