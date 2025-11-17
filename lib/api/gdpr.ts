import { annaConversations, chatMembers, chats, db, messages, users } from "@/db";
import { eq } from "drizzle-orm";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export interface UserDataExport {
  user: any;
  chats: any[];
  messages: any[];
  annaConversations: any[];
  exportDate: string;
}

export async function exportUserData(userId: string): Promise<string | null> {
  try {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0]) return null;

    const memberChats = await db
      .select()
      .from(chatMembers)
      .where(eq(chatMembers.userId, userId));

    const chatIds = memberChats.map((m) => m.chatId);
    const userChats = [];
    for (const chatId of chatIds) {
      const chat = await db.select().from(chats).where(eq(chats.id, chatId)).limit(1);
      if (chat[0]) userChats.push(chat[0]);
    }

    const allMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.userId, userId));

    const annaConvs = await db
      .select()
      .from(annaConversations)
      .where(eq(annaConversations.userId, userId));

    const exportData: UserDataExport = {
      user: user[0],
      chats: userChats,
      messages: allMessages,
      annaConversations: annaConvs,
      exportDate: new Date().toISOString(),
    };

    const jsonData = JSON.stringify(exportData, null, 2);
    const fileName = `nullxes_data_export_${Date.now()}.json`;
    const documentDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
    if (!documentDir) {
      throw new Error("Document directory not available");
    }
    const fileUri = `${documentDir}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, jsonData, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    }

    return fileUri;
  } catch (error) {
    console.error("Error exporting user data:", error);
    return null;
  }
}

export async function deleteUserAccount(userId: string): Promise<boolean> {
  try {
    await db.delete(users).where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("Error deleting user account:", error);
    return false;
  }
}

export async function anonymizeUserData(userId: string): Promise<boolean> {
  try {
    await db
      .update(users)
      .set({
        name: "Deleted User",
        avatar: null,
        status: null,
        phone: `deleted_${userId.slice(0, 8)}`,
      })
      .where(eq(users.id, userId));

    await db.delete(messages).where(eq(messages.userId, userId));
    await db.delete(annaConversations).where(eq(annaConversations.userId, userId));

    return true;
  } catch (error) {
    console.error("Error anonymizing user data:", error);
    return false;
  }
}

