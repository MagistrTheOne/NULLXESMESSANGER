import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { List, MagnifyingGlass } from "phosphor-react-native";
import { ChatListItem } from "@/components/ChatListItem";
import { StoryCircle } from "@/components/StoryCircle";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { getUserChats } from "@/lib/api/db";
import { formatTime } from "@/lib/utils/format";

export default function ChatsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const chats = useChatStore((state) => state.chats);
  const setChats = useChatStore((state) => state.setChats);
  const toggleDrawer = useUIStore((state) => state.toggleDrawer);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChats();
  }, [user?.id]);

  const loadChats = async () => {
    if (!user?.id) return;
    try {
      const userChats = await getUserChats(user.id);
      setChats(
        userChats.map((chat) => ({
          id: chat.id,
          type: chat.type as "private" | "group" | "channel",
          name: chat.name || undefined,
          avatar: chat.avatar || undefined,
          lastMessage: chat.lastMessage || undefined,
          lastMessageAt: chat.lastMessageAt || undefined,
        }))
      );
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const stories = [
    { id: "1", name: "Моя история", isOwn: true },
    { id: "2", name: "Calem", hasNew: true },
    { id: "3", name: "imavki", hasNew: true },
    { id: "4", name: "Мари" },
  ];

  return (
    <View className="flex-1 bg-primary">
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={toggleDrawer} className="p-2">
            <List size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-text-primary text-xl font-bold">NULLXES</Text>
          <TouchableOpacity className="p-2">
            <MagnifyingGlass size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={stories}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        renderItem={({ item }) => (
          <StoryCircle
            name={item.name}
            isOwn={item.isOwn}
            hasNew={item.hasNew}
            onPress={() => {}}
          />
        )}
        keyExtractor={(item) => item.id}
      />

      <View className="flex-row px-4 py-2 border-b border-accent/10">
        <TouchableOpacity className="mr-4">
          <Text className="text-accent text-base font-semibold border-b-2 border-accent pb-1">
            Все чаты
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text className="text-text-secondary text-base">Личные</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatListItem
            id={item.id}
            name={item.name || "Без названия"}
            avatar={item.avatar}
            lastMessage={item.lastMessage}
            time={item.lastMessageAt ? formatTime(item.lastMessageAt) : undefined}
            unreadCount={item.unreadCount}
            isPinned={false}
            isRead={true}
            onPress={() => router.push(`/(main)/chat/${item.id}`)}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00B7FF" />}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <View className="absolute bottom-6 right-6">
        <FloatingActionButton
          icon="pencil"
          onPress={() => router.push("/(main)/chats/new")}
        />
      </View>
    </View>
  );
}

