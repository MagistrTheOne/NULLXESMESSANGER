import { annaConversations, blockedUsers, calls, chatMembers, chats, contacts, db, favorites, messageReactions, messages, pinnedChats, searchHistory, stories, storyViews, userSessions, users } from "@/db";
import { and, desc, eq, gt, gte, isNull, lte, or } from "drizzle-orm";

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

export async function updateUser(
  id: string,
  data: {
    name?: string;
    avatar?: string;
    status?: string;
    gdprConsent?: boolean;
    dataProcessingConsent?: boolean;
    marketingConsent?: boolean;
    fz152Consent?: boolean;
    ccpaOptOut?: boolean;
  }
) {
  const updateData: any = { ...data, updatedAt: new Date() };
  if (data.gdprConsent) {
    updateData.gdprConsentDate = new Date();
  }
  if (data.fz152Consent) {
    updateData.fz152ConsentDate = new Date();
  }
  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning();
  return updated;
}

export async function updateUserOnlineStatus(id: string, status: "online" | "offline" | "recently") {
  const [updated] = await db
    .update(users)
    .set({ onlineStatus: status, lastSeen: new Date(), updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return updated;
}

export async function createChat(type: "private" | "group" | "channel", memberIds: string[], name?: string, avatar?: string) {
  const [chat] = await db
    .insert(chats)
    .values({
      type,
      name,
      avatar,
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

export async function getUserChats(userId: string, includeArchived = false) {
  const conditions = [eq(chatMembers.userId, userId)];
  if (!includeArchived) {
    conditions.push(eq(chats.isArchived, false));
  }
  conditions.push(isNull(chats.deletedAt));

  const userChats = await db
    .select({
      chat: chats,
    })
    .from(chatMembers)
    .innerJoin(chats, eq(chatMembers.chatId, chats.id))
    .where(and(...conditions))
    .orderBy(desc(chats.updatedAt));

  const chatsWithStatus = await Promise.all(
    userChats.map(async (uc) => {
      const chat = uc.chat;
      if (chat.type === "private") {
        const otherMember = await db
          .select({ userId: chatMembers.userId })
          .from(chatMembers)
          .where(and(eq(chatMembers.chatId, chat.id), eq(chatMembers.userId, userId)))
          .limit(1);

        const allMembers = await db
          .select({ userId: chatMembers.userId })
          .from(chatMembers)
          .where(eq(chatMembers.chatId, chat.id));

        const otherUserId = allMembers.find((m) => m.userId !== userId)?.userId;
        if (otherUserId) {
          const otherUser = await getUserById(otherUserId);
          return {
            ...chat,
            otherUserOnlineStatus: otherUser?.onlineStatus as "online" | "offline" | "recently" | undefined,
          };
        }
      }
      return chat;
    })
  );

  return chatsWithStatus;
}

export async function getChatOtherUserStatus(chatId: string, currentUserId: string) {
  const allMembers = await db
    .select({ userId: chatMembers.userId })
    .from(chatMembers)
    .where(eq(chatMembers.chatId, chatId));

  const otherUserId = allMembers.find((m) => m.userId !== currentUserId)?.userId;
  if (!otherUserId) return undefined;

  const otherUser = await getUserById(otherUserId);
  return otherUser?.onlineStatus as "online" | "offline" | "recently" | undefined;
}

export async function archiveChat(chatId: string) {
  const [updated] = await db
    .update(chats)
    .set({
      isArchived: true,
      updatedAt: new Date(),
    })
    .where(eq(chats.id, chatId))
    .returning();
  return updated;
}

export async function unarchiveChat(chatId: string) {
  const [updated] = await db
    .update(chats)
    .set({
      isArchived: false,
      updatedAt: new Date(),
    })
    .where(eq(chats.id, chatId))
    .returning();
  return updated;
}

export async function deleteChat(chatId: string) {
  const [updated] = await db
    .update(chats)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(chats.id, chatId))
    .returning();
  return updated;
}

export async function getChatMessages(chatId: string, limit = 50) {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

export async function getChatMedia(chatId: string) {
  return await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.chatId, chatId),
        or(
          eq(messages.type, "image"),
          eq(messages.type, "video"),
          eq(messages.type, "file")
        )
      )
    )
    .orderBy(desc(messages.createdAt));
}

export async function getMessageById(messageId: string) {
  const [message] = await db
    .select()
    .from(messages)
    .where(eq(messages.id, messageId))
    .limit(1);
  return message;
}

export async function searchMessages(userId: string, query: string, filters?: {
  chatId?: string;
  senderId?: string;
  messageType?: "text" | "image" | "voice" | "video" | "file";
  dateFrom?: Date;
  dateTo?: Date;
}) {
  const userChats = await getUserChats(userId, true);
  const chatIds = userChats.map((chat) => chat.id);

  if (chatIds.length === 0) return [];

  let conditions: any[] = [
    or(...chatIds.map((id) => eq(messages.chatId, id))),
  ];

  if (filters?.chatId) {
    conditions.push(eq(messages.chatId, filters.chatId));
  }

  if (filters?.senderId) {
    conditions.push(eq(messages.userId, filters.senderId));
  }

  if (filters?.messageType) {
    conditions.push(eq(messages.type, filters.messageType));
  }

  if (filters?.dateFrom) {
    conditions.push(gte(messages.createdAt, filters.dateFrom));
  }

  if (filters?.dateTo) {
    conditions.push(lte(messages.createdAt, filters.dateTo));
  }

  const allMessages = await db
    .select()
    .from(messages)
    .where(and(...conditions))
    .orderBy(desc(messages.createdAt))
    .limit(500);

  const queryLower = query.toLowerCase();
  return allMessages.filter((msg) => {
    if (msg.type === "text" || msg.type === "file") {
      return msg.content.toLowerCase().includes(queryLower);
    }
    return false;
  });
}

export async function searchContacts(userId: string, query: string) {
  const userContacts = await getUserContacts(userId);
  const queryLower = query.toLowerCase();
  
  return userContacts.filter((contact) => {
    return (
      contact.name?.toLowerCase().includes(queryLower) ||
      contact.phone?.toLowerCase().includes(queryLower)
    );
  });
}

export async function searchMedia(userId: string, query: string, filters?: {
  chatId?: string;
  mediaType?: "image" | "video" | "file";
  dateFrom?: Date;
  dateTo?: Date;
}) {
  const userChats = await getUserChats(userId, true);
  const chatIds = userChats.map((chat) => chat.id);

  if (chatIds.length === 0) return [];

  let conditions: any[] = [
    or(...chatIds.map((id) => eq(messages.chatId, id))),
    or(
      eq(messages.type, "image"),
      eq(messages.type, "video"),
      eq(messages.type, "file")
    ),
  ];

  if (filters?.chatId) {
    conditions.push(eq(messages.chatId, filters.chatId));
  }

  if (filters?.mediaType) {
    conditions.push(eq(messages.type, filters.mediaType));
  }

  if (filters?.dateFrom) {
    conditions.push(gte(messages.createdAt, filters.dateFrom));
  }

  if (filters?.dateTo) {
    conditions.push(lte(messages.createdAt, filters.dateTo));
  }

  const allMedia = await db
    .select()
    .from(messages)
    .where(and(...conditions))
    .orderBy(desc(messages.createdAt))
    .limit(500);

  const queryLower = query.toLowerCase();
  return allMedia.filter((msg) => {
    if (msg.type === "file") {
      return msg.content.toLowerCase().includes(queryLower);
    }
    return true;
  });
}

export async function createMessage(
  chatId: string,
  userId: string,
  content: string,
  type: "text" | "image" | "voice" | "video" | "file" = "text",
  replyToId?: string | null
) {
  const [message] = await db
    .insert(messages)
    .values({
      chatId,
      userId,
      content,
      type,
      replyToId: replyToId || null,
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

export async function addFavorite(
  userId: string,
  type: "message" | "media" | "link",
  messageId?: string,
  chatId?: string,
  content?: string,
  metadata?: any
) {
  const [favorite] = await db
    .insert(favorites)
    .values({
      userId,
      type,
      messageId,
      chatId,
      content,
      metadata,
    })
    .returning();
  return favorite;
}

export async function removeFavorite(favoriteId: string) {
  await db.delete(favorites).where(eq(favorites.id, favoriteId));
}

export async function getUserFavorites(userId: string, type?: "message" | "media" | "link") {
  const conditions = [eq(favorites.userId, userId)];
  if (type) {
    conditions.push(eq(favorites.type, type));
  }
  return await db
    .select()
    .from(favorites)
    .where(and(...conditions))
    .orderBy(desc(favorites.createdAt));
}

export async function isMessageFavorite(userId: string, messageId: string) {
  const [favorite] = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.messageId, messageId)))
    .limit(1);
  return !!favorite;
}

export async function pinChat(userId: string, chatId: string) {
  const existing = await db
    .select()
    .from(pinnedChats)
    .where(and(eq(pinnedChats.userId, userId), eq(pinnedChats.chatId, chatId)))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const maxOrder = await db
    .select()
    .from(pinnedChats)
    .where(eq(pinnedChats.userId, userId))
    .orderBy(desc(pinnedChats.order))
    .limit(1);

  const newOrder = maxOrder.length > 0 ? String(parseInt(maxOrder[0].order || "0") + 1) : "1";

  const [pinned] = await db
    .insert(pinnedChats)
    .values({
      userId,
      chatId,
      order: newOrder,
    })
    .returning();
  return pinned;
}

export async function unpinChat(userId: string, chatId: string) {
  await db
    .delete(pinnedChats)
    .where(and(eq(pinnedChats.userId, userId), eq(pinnedChats.chatId, chatId)));
}

export async function getUserPinnedChats(userId: string) {
  return await db
    .select()
    .from(pinnedChats)
    .where(eq(pinnedChats.userId, userId))
    .orderBy(desc(pinnedChats.order));
}

export async function isChatPinned(userId: string, chatId: string) {
  const [pinned] = await db
    .select()
    .from(pinnedChats)
    .where(and(eq(pinnedChats.userId, userId), eq(pinnedChats.chatId, chatId)))
    .limit(1);
  return !!pinned;
}

export async function getUserStats(userId: string) {
  const userChatsList = await getUserChats(userId, true);
  const chatsCount = userChatsList.length;

  const userMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.userId, userId));

  const messagesCount = userMessages.length;
  const mediaCount = userMessages.filter(
    (msg) => msg.type === "image" || msg.type === "video" || msg.type === "file"
  ).length;

  const userFavoritesList = await getUserFavorites(userId);
  const favoritesCount = userFavoritesList.length;

  return {
    chatsCount,
    messagesCount,
    mediaCount,
    favoritesCount,
  };
}

export async function createStory(
  userId: string,
  mediaUri: string,
  mediaType: "image" | "video",
  privacy: "public" | "contacts" | "close_friends" | "custom" = "public",
  allowedUserIds: string[] = []
) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const [story] = await db
    .insert(stories)
    .values({
      userId,
      mediaUri,
      mediaType,
      expiresAt,
      privacy,
      allowedUserIds: allowedUserIds.length > 0 ? allowedUserIds : [],
    })
    .returning();
  return story;
}

export async function getUserStories(userId: string) {
  const now = new Date();
  return await db
    .select()
    .from(stories)
    .where(and(eq(stories.userId, userId), gt(stories.expiresAt, now)))
    .orderBy(desc(stories.createdAt));
}

export async function getActiveStories(userId: string) {
  const now = new Date();
  const userChats = await getUserChats(userId);
  const chatUserIds = new Set<string>();
  
  for (const chat of userChats) {
    if (chat.type === "private") {
      const members = await db
        .select({ userId: chatMembers.userId })
        .from(chatMembers)
        .where(eq(chatMembers.chatId, chat.id));
      members.forEach((m) => {
        if (m.userId !== userId) chatUserIds.add(m.userId);
      });
    }
  }
  chatUserIds.add(userId);

  const allStories = await db
    .select()
    .from(stories)
    .where(and(gt(stories.expiresAt, now)))
    .orderBy(desc(stories.createdAt));

  const userContacts = await getUserContacts(userId);
  const contactUserIds = new Set(userContacts.map((c) => c.contactUserId).filter(Boolean) as string[]);

  return allStories.filter((s) => {
    if (s.userId === userId) return true;
    if (!chatUserIds.has(s.userId)) return false;

    if (s.privacy === "public") return true;
    if (s.privacy === "contacts" && contactUserIds.has(s.userId)) return true;
    if (s.privacy === "close_friends") {
      // TODO: Implement close friends list
      return contactUserIds.has(s.userId);
    }
    if (s.privacy === "custom") {
      const allowedIds = (s.allowedUserIds as string[]) || [];
      return allowedIds.includes(userId);
    }
    return false;
  });
}

export async function viewStory(storyId: string, userId: string) {
  const existing = await db
    .select()
    .from(storyViews)
    .where(and(eq(storyViews.storyId, storyId), eq(storyViews.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const [view] = await db
    .insert(storyViews)
    .values({
      storyId,
      userId,
    })
    .returning();

  await db
    .update(stories)
    .set({
      viewsCount: String(parseInt((await db.select().from(stories).where(eq(stories.id, storyId)).limit(1))[0]?.viewsCount || "0") + 1),
    })
    .where(eq(stories.id, storyId));

  return view;
}

export async function createCall(
  userId: string,
  chatId: string | null,
  otherUserId: string | null,
  type: "voice" | "video",
  status: "missed" | "incoming" | "outgoing",
  duration?: string
) {
  const [call] = await db
    .insert(calls)
    .values({
      userId,
      chatId: chatId || null,
      otherUserId: otherUserId || null,
      type,
      status,
      duration,
    })
    .returning();
  return call;
}

export async function getUserCalls(userId: string) {
  return await db
    .select()
    .from(calls)
    .where(eq(calls.userId, userId))
    .orderBy(desc(calls.createdAt));
}

export async function addContact(userId: string, contactUserId: string | null, phone: string | null, name?: string, avatar?: string) {
  const [contact] = await db
    .insert(contacts)
    .values({
      userId,
      contactUserId: contactUserId || null,
      phone: phone || null,
      name,
      avatar,
    })
    .returning();
  return contact;
}

export async function getUserContacts(userId: string) {
  return await db
    .select()
    .from(contacts)
    .where(eq(contacts.userId, userId))
    .orderBy(desc(contacts.isFavorite), desc(contacts.updatedAt));
}

export async function deleteContact(contactId: string) {
  await db.delete(contacts).where(eq(contacts.id, contactId));
}

export async function toggleFavoriteContact(contactId: string, isFavorite: boolean) {
  const [updated] = await db
    .update(contacts)
    .set({ isFavorite, updatedAt: new Date() })
    .where(eq(contacts.id, contactId))
    .returning();
  return updated;
}

export async function blockUser(userId: string, blockedUserId: string) {
  const existing = await db
    .select()
    .from(blockedUsers)
    .where(and(eq(blockedUsers.userId, userId), eq(blockedUsers.blockedUserId, blockedUserId)))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const [blocked] = await db
    .insert(blockedUsers)
    .values({
      userId,
      blockedUserId,
    })
    .returning();
  return blocked;
}

export async function unblockUser(userId: string, blockedUserId: string) {
  await db
    .delete(blockedUsers)
    .where(and(eq(blockedUsers.userId, userId), eq(blockedUsers.blockedUserId, blockedUserId)));
}

export async function getBlockedUsers(userId: string) {
  return await db
    .select({
      id: blockedUsers.id,
      blockedUserId: blockedUsers.blockedUserId,
      createdAt: blockedUsers.createdAt,
      user: users,
    })
    .from(blockedUsers)
    .innerJoin(users, eq(blockedUsers.blockedUserId, users.id))
    .where(eq(blockedUsers.userId, userId))
    .orderBy(desc(blockedUsers.createdAt));
}

export async function isUserBlocked(userId: string, otherUserId: string) {
  const [blocked] = await db
    .select()
    .from(blockedUsers)
    .where(and(eq(blockedUsers.userId, userId), eq(blockedUsers.blockedUserId, otherUserId)))
    .limit(1);
  return !!blocked;
}

export async function createUserSession(userId: string, deviceName: string, deviceType: string, ipAddress?: string) {
  const [session] = await db
    .insert(userSessions)
    .values({
      userId,
      deviceName,
      deviceType,
      ipAddress,
    })
    .returning();
  return session;
}

export async function getUserSessions(userId: string) {
  return await db
    .select()
    .from(userSessions)
    .where(eq(userSessions.userId, userId))
    .orderBy(desc(userSessions.lastActiveAt));
}

export async function updateMessage(messageId: string, content: string) {
  const [updated] = await db
    .update(messages)
    .set({ content })
    .where(eq(messages.id, messageId))
    .returning();
  return updated;
}

export async function deleteMessage(messageId: string, deleteForEveryone: boolean) {
  if (deleteForEveryone) {
    await db.delete(messages).where(eq(messages.id, messageId));
  } else {
    await db
      .update(messages)
      .set({ content: "Сообщение удалено", metadata: { deleted: true } })
      .where(eq(messages.id, messageId));
  }
}

export async function forwardMessage(messageId: string, targetChatIds: string[], userId: string) {
  const [originalMessage] = await db
    .select()
    .from(messages)
    .where(eq(messages.id, messageId))
    .limit(1);

  if (!originalMessage) return [];

  const originalMetadata = originalMessage.metadata as Record<string, any> || {};
  const forwardedMetadata = { ...originalMetadata, forwarded: true, originalMessageId: messageId };

  const forwardedMessages = await Promise.all(
    targetChatIds.map(async (chatId) => {
      const [forwarded] = await db
        .insert(messages)
        .values({
          chatId,
          userId,
          content: originalMessage.content,
          type: originalMessage.type,
          metadata: forwardedMetadata,
        })
        .returning();
      return forwarded;
    })
  );

  return forwardedMessages;
}

export async function addMessageReaction(messageId: string, userId: string, emoji: string) {
  const existing = await db
    .select()
    .from(messageReactions)
    .where(and(eq(messageReactions.messageId, messageId), eq(messageReactions.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(messageReactions)
      .set({ emoji })
      .where(eq(messageReactions.id, existing[0].id));
    return existing[0];
  }

  const [reaction] = await db
    .insert(messageReactions)
    .values({
      messageId,
      userId,
      emoji,
    })
    .returning();
  return reaction;
}

export async function removeMessageReaction(messageId: string, userId: string) {
  await db
    .delete(messageReactions)
    .where(and(eq(messageReactions.messageId, messageId), eq(messageReactions.userId, userId)));
}

export async function getMessageReactions(messageId: string) {
  return await db
    .select()
    .from(messageReactions)
    .where(eq(messageReactions.messageId, messageId));
}

export async function addSearchHistory(userId: string, query: string, tab: string = "all") {
  if (!query.trim()) return;
  
  await db.insert(searchHistory).values({
    userId,
    query: query.trim(),
    tab,
  });
}

export async function getSearchHistory(userId: string, limit: number = 10) {
  return await db
    .select()
    .from(searchHistory)
    .where(eq(searchHistory.userId, userId))
    .orderBy(desc(searchHistory.createdAt))
    .limit(limit);
}

export async function deleteSearchHistory(userId: string, historyId?: string) {
  if (historyId) {
    await db.delete(searchHistory).where(and(eq(searchHistory.id, historyId), eq(searchHistory.userId, userId)));
  } else {
    await db.delete(searchHistory).where(eq(searchHistory.userId, userId));
  }
}

export async function replyToStory(storyId: string, userId: string, message: string) {
  const [story] = await db.select().from(stories).where(eq(stories.id, storyId)).limit(1);
  if (!story) throw new Error("Story not found");

  const storyOwnerId = story.userId;
  
  // Find or create private chat with story owner
  const userChats = await getUserChats(userId, true);
  let chatId: string | null = null;

  for (const chat of userChats) {
    if (chat.type === "private") {
      const members = await db
        .select({ userId: chatMembers.userId })
        .from(chatMembers)
        .where(eq(chatMembers.chatId, chat.id));
      const memberIds = members.map((m) => m.userId);
      if (memberIds.includes(userId) && memberIds.includes(storyOwnerId)) {
        chatId = chat.id;
        break;
      }
    }
  }

  if (!chatId) {
    const newChat = await createChat("private", [userId, storyOwnerId]);
    chatId = newChat.id;
  }

  // Create message with story reference
  const [replyMessage] = await db
    .insert(messages)
    .values({
      chatId,
      userId,
      content: message,
      type: "text",
      metadata: { storyId, storyReply: true },
    })
    .returning();

  return replyMessage;
}

