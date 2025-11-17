import { Avatar } from "@/components/ui/Avatar";
import { createCall, getUserCalls } from "@/lib/api/db";
import { formatTime } from "@/lib/utils/format";
import { useAuthStore } from "@/stores/authStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ArrowLeft, Phone, PhoneCall, PhoneIncoming, PhoneOutgoing, PhoneSlash, VideoCamera } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, ScrollView, Alert } from "react-native";

export default function CallsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [calls, setCalls] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "missed" | "incoming" | "outgoing">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadCalls();
    }
  }, [user?.id, filter]);

  const loadCalls = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const userCalls = await getUserCalls(user.id);
      setCalls(userCalls);
    } catch (error) {
      console.error("Error loading calls:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = async (chatId: string | null, otherUserId: string | null, type: "voice" | "video") => {
    if (!user?.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await createCall(user.id, chatId, otherUserId, type, "outgoing");
      // TODO: Implement actual call functionality
      Alert.alert("Звонок", `Инициирован ${type === "voice" ? "голосовой" : "видео"} звонок`);
    } catch (error) {
      console.error("Error creating call:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const filteredCalls = calls.filter((call) => {
    if (filter === "all") return true;
    return call.status === filter;
  });

  const getStatusIcon = (status: string, type: string) => {
    if (status === "missed") {
      return <PhoneSlash size={20} color="#FF1A4B" />;
    }
    if (status === "incoming") {
      return <PhoneIncoming size={20} color="#00B7FF" />;
    }
    if (status === "outgoing") {
      return <PhoneOutgoing size={20} color="#00FF00" />;
    }
    return type === "video" ? <VideoCamera size={20} color="#00B7FF" /> : <Phone size={20} color="#00B7FF" />;
  };

  return (
    <View className="flex-1 bg-primary">
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-text-primary text-lg font-semibold flex-1">Звонки</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {[
            { type: "all", label: "Все" },
            { type: "missed", label: "Пропущенные" },
            { type: "incoming", label: "Входящие" },
            { type: "outgoing", label: "Исходящие" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.type}
              onPress={() => {
                setFilter(tab.type as any);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className={`px-4 py-2 mr-2 rounded-full ${
                filter === tab.type ? "bg-accent/20" : "bg-secondary/60"
              }`}
            >
              <Text
                className={`text-sm ${
                  filter === tab.type ? "text-accent font-semibold" : "text-text-secondary"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-secondary">Загрузка...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCalls}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="px-4 py-3 bg-secondary/40 border-b border-accent/10 flex-row items-center"
              activeOpacity={0.7}
              onPress={() => handleCall(item.chatId, item.otherUserId, item.type)}
            >
              <View className="mr-3">
                {getStatusIcon(item.status, item.type)}
              </View>
              <View className="flex-1">
                <Text className="text-text-primary font-semibold">
                  {item.otherUserId || "Неизвестный"}
                </Text>
                <Text className="text-text-secondary text-sm">
                  {item.type === "video" ? "Видеозвонок" : "Голосовой звонок"} • {formatTime(item.createdAt)}
                </Text>
                {item.duration && (
                  <Text className="text-text-muted text-xs mt-1">Длительность: {item.duration}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-6 mt-20">
              <PhoneCall size={64} color="#6B7280" weight="thin" />
              <Text className="text-text-muted text-base mt-4 text-center">
                {filter === "all" ? "Нет звонков" : `Нет ${filter === "missed" ? "пропущенных" : filter === "incoming" ? "входящих" : "исходящих"} звонков`}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

