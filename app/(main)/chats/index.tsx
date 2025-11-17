import { FloatingActionButton } from "@/components/FloatingActionButton";
import { StoryCircle } from "@/components/StoryCircle";
import { SwipeableChatListItem } from "@/components/SwipeableChatListItem";
import { archiveChat, deleteChat, getActiveStories, getUserChats, getUserPinnedChats, pinChat, unpinChat } from "@/lib/api/db";
import { formatTime } from "@/lib/utils/format";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useUIStore } from "@/stores/uiStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { List, MagnifyingGlass } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";

export default function ChatsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const chats = useChatStore((state) => state.chats);
  const setChats = useChatStore((state) => state.setChats);
  const toggleDrawer = useUIStore((state) => state.toggleDrawer);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "private">("all");

  useEffect(() => {
    loadChats();
  }, [user?.id]);

  const loadChats = async () => {
    if (!user?.id) return;
    try {
      const [userChats, pinnedChatsList] = await Promise.all([
        getUserChats(user.id),
        getUserPinnedChats(user.id),
      ]);

      const pinnedChatIds = new Set(pinnedChatsList.map((pc) => pc.chatId));

      const chatsWithPinned = userChats.map((chat: any) => ({
        id: chat.id,
        type: chat.type as "private" | "group" | "channel",
        name: chat.name || undefined,
        avatar: chat.avatar || undefined,
        lastMessage: chat.lastMessage || undefined,
        lastMessageAt: chat.lastMessageAt || undefined,
        isPinned: pinnedChatIds.has(chat.id),
        onlineStatus: chat.otherUserOnlineStatus as "online" | "offline" | "recently" | undefined,
      }));

      const filteredChats =
        filter === "private"
          ? chatsWithPinned.filter((chat) => chat.type === "private")
          : chatsWithPinned;

      const sortedChats = [...filteredChats].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const aTime = a.lastMessageAt?.getTime() || 0;
        const bTime = b.lastMessageAt?.getTime() || 0;
        return bTime - aTime;
      });

      setChats(sortedChats);
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  const handleTogglePin = async (chatId: string, isPinned: boolean) => {
    if (!user?.id) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isPinned) {
        await unpinChat(user.id, chatId);
      } else {
        await pinChat(user.id, chatId);
      }
      await loadChats();
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
      await loadChats();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error archiving chat:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDelete = async (chatId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Удалить чат?",
      "Чат будет удалён. Это действие нельзя отменить.",
      [
        {
          text: "Отмена",
          style: "cancel",
        },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteChat(chatId);
              await loadChats();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error("Error deleting chat:", error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const [storiesList, setStoriesList] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadStories();
    }
  }, [user?.id]);

  const loadStories = async () => {
    if (!user?.id) return;
    try {
      const activeStories = await getActiveStories(user.id);
      const storiesByUser = new Map<string, any[]>();
      
      activeStories.forEach((story) => {
        if (!storiesByUser.has(story.userId)) {
          storiesByUser.set(story.userId, []);
        }
        storiesByUser.get(story.userId)!.push(story);
      });

      const storiesData = Array.from(storiesByUser.entries()).map(([userId, userStories]) => {
        const isOwn = userId === user.id;
        const hasNew = userStories.some((s) => {
          const viewed = false;
          return !viewed;
        });
        return {
          id: userId,
          userId,
          name: isOwn ? "Моя история" : "История",
          isOwn,
          hasNew,
          stories: userStories,
        };
      });

      if (storiesData.length === 0 || !storiesData.some((s) => s.isOwn)) {
        storiesData.unshift({
          id: "create",
          userId: user.id,
          name: "Моя история",
          isOwn: true,
          hasNew: false,
          stories: [],
        });
      }

      setStoriesList(storiesData);
    } catch (error) {
      console.error("Error loading stories:", error);
    }
  };

  return (
    <View className="flex-1 bg-primary">
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={toggleDrawer} className="p-2">
            <List size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-text-primary text-xl font-bold">NULLXES</Text>
          <TouchableOpacity
            className="p-2"
            onPress={() => {
              router.push("/chats/search" as any);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <MagnifyingGlass size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={storiesList}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        renderItem={({ item }) => (
          <StoryCircle
            name={item.name}
            isOwn={item.isOwn}
            hasNew={item.hasNew}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (item.isOwn && item.stories.length === 0) {
                router.push("/stories/create" as any);
              } else {
                router.push(`/stories/viewer?userId=${item.userId}` as any);
              }
            }}
          />
        )}
        keyExtractor={(item) => item.id}
      />

      <View className="flex-row px-4 py-2 border-b border-accent/10">
        <TouchableOpacity
          className="mr-4"
          onPress={() => {
            setFilter("all");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            loadChats();
          }}
        >
          <Text
            className={`text-base font-semibold pb-1 ${
              filter === "all"
                ? "text-accent border-b-2 border-accent"
                : "text-text-secondary"
            }`}
          >
            Все чаты
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setFilter("private");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            loadChats();
          }}
        >
          <Text
            className={`text-base font-semibold pb-1 ${
              filter === "private"
                ? "text-accent border-b-2 border-accent"
                : "text-text-secondary"
            }`}
          >
            Личные
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={chats}
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00B7FF" />}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <View className="absolute bottom-6 right-6">
        <FloatingActionButton
          icon="pencil"
          onPress={() => router.push("/chats/new" as any)}
        />
      </View>
    </View>
  );
}

