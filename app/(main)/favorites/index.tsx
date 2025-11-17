import { NeonGlow } from "@/components/NeonGlow";
import { Card } from "@/components/ui/Card";
import { getUserFavorites, removeFavorite } from "@/lib/api/db";
import { formatTime } from "@/lib/utils/format";
import { useAuthStore } from "@/stores/authStore";
import { useFavoritesStore, type FavoriteType } from "@/stores/favoritesStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ArrowLeft, Bookmark, ChatText, Image as ImageIcon, Link, X } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function FavoritesScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { favorites, setFavorites, removeFavorite: removeFromStore } = useFavoritesStore();
  const [activeTab, setActiveTab] = useState<FavoriteType | "all">("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadFavorites();
    }
  }, [user?.id]);

  const loadFavorites = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const dbFavorites = await getUserFavorites(user.id);
      setFavorites(
        dbFavorites.map((fav) => ({
          id: fav.id,
          userId: fav.userId,
          type: fav.type as FavoriteType,
          messageId: fav.messageId || undefined,
          chatId: fav.chatId || undefined,
          content: fav.content || undefined,
          metadata: fav.metadata || undefined,
          createdAt: fav.createdAt,
        }))
      );
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await removeFavorite(favoriteId);
      removeFromStore(favoriteId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error removing favorite:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const filteredFavorites =
    activeTab === "all"
      ? favorites
      : favorites.filter((fav) => fav.type === activeTab);

  const tabs: Array<{ type: FavoriteType | "all"; label: string; icon: any }> = [
    { type: "all", label: "Все", icon: Bookmark },
    { type: "message", label: "Сообщения", icon: ChatText },
    { type: "media", label: "Медиа", icon: ImageIcon },
    { type: "link", label: "Ссылки", icon: Link },
  ];

  const renderFavorite = ({ item }: { item: typeof favorites[0] }) => {
    const getTypeIcon = () => {
      switch (item.type) {
        case "message":
          return <ChatText size={20} color="#00B7FF" />;
        case "media":
          return <ImageIcon size={20} color="#00B7FF" />;
        case "link":
          return <Link size={20} color="#00B7FF" />;
        default:
          return <Bookmark size={20} color="#00B7FF" />;
      }
    };

    return (
      <Card className="p-4 mb-3">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-2">
              {getTypeIcon()}
              <Text className="text-text-secondary text-xs ml-2">
                {formatTime(item.createdAt)}
              </Text>
            </View>
            {item.type === "media" && item.metadata?.uri && (
              <Image
                source={{ uri: item.metadata.uri }}
                style={{ width: "100%", height: 200, borderRadius: 8, marginBottom: 8 }}
                resizeMode="cover"
              />
            )}
            {item.content && (
              <Text className="text-text-primary text-base" numberOfLines={3}>
                {item.content}
              </Text>
            )}
            {item.type === "link" && item.metadata?.url && (
              <Text className="text-accent text-sm mt-1" numberOfLines={1}>
                {item.metadata.url}
              </Text>
            )}
          </View>
          <NeonGlow color="blue" intensity="low">
            <TouchableOpacity
              onPress={() => handleRemoveFavorite(item.id)}
              className="bg-danger/20 rounded-full p-2"
            >
              <X size={18} color="#FF1A4B" />
            </TouchableOpacity>
          </NeonGlow>
        </View>
      </Card>
    );
  };

  return (
    <View className="flex-1 bg-primary">
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-text-primary text-lg font-semibold flex-1">Избранное</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.type;
            return (
              <TouchableOpacity
                key={tab.type}
                onPress={() => {
                  setActiveTab(tab.type);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className={`flex-row items-center px-4 py-2 mr-2 rounded-full ${
                  isActive ? "bg-accent/20" : "bg-secondary/60"
                }`}
              >
                <Icon
                  size={18}
                  color={isActive ? "#00B7FF" : "#B0B8C0"}
                  weight={isActive ? "fill" : "regular"}
                />
                <Text
                  className={`text-sm ml-2 ${
                    isActive ? "text-accent font-semibold" : "text-text-secondary"
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-secondary">Загрузка...</Text>
        </View>
      ) : filteredFavorites.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Bookmark size={64} color="#6B7280" weight="thin" />
          <Text className="text-text-muted text-base mt-4 text-center">
            {activeTab === "all"
              ? "Нет сохранённых элементов"
              : `Нет сохранённых ${tabs.find((t) => t.type === activeTab)?.label.toLowerCase()}`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredFavorites}
          keyExtractor={(item) => item.id}
          renderItem={renderFavorite}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
}

