import { SwipeableChatListItem } from "@/components/SwipeableChatListItem";
import { archiveChat, deleteChat, getUserChats, getUserPinnedChats, pinChat, unpinChat } from "@/lib/api/db";
import { formatTime } from "@/lib/utils/format";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ArrowLeft, MagnifyingGlass, X } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ChatSearchScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { chats, setChats } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [allChats, setAllChats] = useState<typeof chats>([]);

  useEffect(() => {
    loadAllChats();
  }, [user?.id]);

  const loadAllChats = async () => {
    if (!user?.id) return;
    try {
      const [userChats, pinnedChatsList] = await Promise.all([
        getUserChats(user.id, true),
        getUserPinnedChats(user.id),
      ]);

      const pinnedChatIds = new Set(pinnedChatsList.map((pc) => pc.chatId));

      const chatsWithPinned = userChats.map((chat) => ({
        id: chat.id,
        type: chat.type as "private" | "group" | "channel",
        name: chat.name || undefined,
        avatar: chat.avatar || undefined,
        lastMessage: chat.lastMessage || undefined,
        lastMessageAt: chat.lastMessageAt || undefined,
        isPinned: pinnedChatIds.has(chat.id),
      }));

      setAllChats(chatsWithPinned);
      setChats(chatsWithPinned);
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  const filteredChats = allChats.filter((chat) => {
    const query = searchQuery.toLowerCase();
    return (
      chat.name?.toLowerCase().includes(query) ||
      chat.lastMessage?.toLowerCase().includes(query)
    );
  });

  const handleTogglePin = async (chatId: string, isPinned: boolean) => {
    if (!user?.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (isPinned) {
        await unpinChat(user.id, chatId);
      } else {
        await pinChat(user.id, chatId);
      }
      await loadAllChats();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error toggling pin:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleArchive = async (chatId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await archiveChat(chatId);
      await loadAllChats();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error archiving chat:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDelete = async (chatId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      await deleteChat(chatId);
      await loadAllChats();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error deleting chat:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-primary"
    >
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View className="flex-1 flex-row items-center bg-secondary/60 rounded-xl px-4 py-2">
            <MagnifyingGlass size={20} color="#6B7280" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Поиск чатов..."
              placeholderTextColor="#6B7280"
              className="flex-1 ml-2 text-text-primary text-base"
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {filteredChats.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <MagnifyingGlass size={64} color="#6B7280" weight="thin" />
          <Text className="text-text-muted text-base mt-4 text-center">
            {searchQuery ? "Чаты не найдены" : "Начните вводить для поиска"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SwipeableChatListItem
              id={item.id}
              name={item.name || "Без названия"}
              avatar={item.avatar}
              lastMessage={item.lastMessage}
              time={item.lastMessageAt ? formatTime(item.lastMessageAt) : undefined}
              unreadCount={item.unreadCount}
              isPinned={item.isPinned || false}
              isRead={true}
              onPress={() => router.push(`/(main)/chat/${item.id}`)}
              onLongPress={() => handleTogglePin(item.id, item.isPinned || false)}
              onArchive={() => handleArchive(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

