import { db, users, chats, messages, chatMembers, annaConversations } from "@/db";
import { eq, desc, and } from "drizzle-orm";

export async function createUser(phone: string, name?: string) {
  const [user] = await db
    .insert(users)
    .values({
      phone,
      name: name || phone,
    })
    .returning();
  return user;
}

export async function getUserByPhone(phone: string) {
  const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  return user;
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user;
}

export async function updateUser(id: string, data: { name?: string; avatar?: string; status?: string }) {
  const [updated] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return updated;
}

export async function createChat(type: "private" | "group" | "channel", memberIds: string[], name?: string) {
  const [chat] = await db
    .insert(chats)
    .values({
      type,
      name,
    })
    .returning();

  await db.insert(chatMembers).values(
    memberIds.map((userId) => ({
      chatId: chat.id,
      userId,
    }))
  );

  return chat;
}

export async function getUserChats(userId: string) {
  const userChats = await db
    .select({
      chat: chats,
    })
    .from(chatMembers)
    .innerJoin(chats, eq(chatMembers.chatId, chats.id))
    .where(eq(chatMembers.userId, userId))
    .orderBy(desc(chats.updatedAt));

  return userChats.map((uc) => uc.chat);
}

export async function getChatMessages(chatId: string, limit = 50) {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

export async function createMessage(chatId: string, userId: string, content: string, type = "text" as const) {
  const [message] = await db
    .insert(messages)
    .values({
      chatId,
      userId,
      content,
      type,
    })
    .returning();

  await db
    .update(chats)
    .set({
      lastMessage: content,
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(chats.id, chatId));

  return message;
}

export async function createAnnaConversation(userId: string, mode = "normal" as const) {
  const [conversation] = await db
    .insert(annaConversations)
    .values({
      userId,
      mode,
      messages: [],
    })
    .returning();
  return conversation;
}

export async function getAnnaConversation(id: string) {
  const [conversation] = await db
    .select()
    .from(annaConversations)
    .where(eq(annaConversations.id, id))
    .limit(1);
  return conversation;
}

export async function getUserAnnaConversations(userId: string) {
  return await db
    .select()
    .from(annaConversations)
    .where(eq(annaConversations.userId, userId))
    .orderBy(desc(annaConversations.updatedAt));
}

export async function updateAnnaConversation(id: string, messages: any[], mode?: string) {
  const [updated] = await db
    .update(annaConversations)
    .set({
      messages,
      mode: mode || undefined,
      updatedAt: new Date(),
    })
    .where(eq(annaConversations.id, id))
    .returning();
  return updated;
}

