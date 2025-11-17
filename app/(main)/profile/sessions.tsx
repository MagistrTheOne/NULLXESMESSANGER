import { getUserSessions, createUserSession, deleteUserSession } from "@/lib/api/db";
import { useAuthStore } from "@/stores/authStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ArrowLeft, Desktop, DeviceMobile, Trash, X } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, Platform } from "react-native";
import * as Device from "expo-device";
import { formatTime } from "@/lib/utils/format";

export default function SessionsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadSessions();
      createCurrentSession();
    }
  }, [user?.id]);

  const createCurrentSession = async () => {
    if (!user?.id) return;
    try {
      const deviceName = Device.deviceName || Device.modelName || "Unknown Device";
      const deviceType = Device.deviceType === Device.DeviceType.PHONE ? "mobile" : Device.deviceType === Device.DeviceType.TABLET ? "tablet" : "desktop";
      await createUserSession(user.id, deviceName, deviceType);
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const loadSessions = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const userSessions = await getUserSessions(user.id);
      setSessions(userSessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Завершить сессию?",
      "Вы уверены, что хотите завершить эту сессию?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Завершить",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUserSession(sessionId);
              await loadSessions();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error("Error terminating session:", error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
        },
      ]
    );
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "mobile":
        return <DeviceMobile size={24} color="#00B7FF" />;
      case "tablet":
        return <DeviceMobile size={24} color="#00B7FF" />;
      default:
        return <Desktop size={24} color="#00B7FF" />;
    }
  };

  return (
    <View className="flex-1 bg-primary">
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-text-primary text-lg font-semibold flex-1">Активные сессии</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-secondary">Загрузка...</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="px-4 py-3 bg-secondary/40 border-b border-accent/10">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  {getDeviceIcon(item.deviceType)}
                  <View className="ml-3 flex-1">
                    <Text className="text-text-primary font-semibold">{item.deviceName}</Text>
                    <Text className="text-text-secondary text-xs mt-1">
                      {item.deviceType} • {item.ipAddress || "IP неизвестен"}
                    </Text>
                    <Text className="text-text-muted text-xs mt-1">
                      Последняя активность: {formatTime(item.lastActiveAt)}
                    </Text>
                  </View>
                </View>
                {item.id !== sessions[0]?.id && (
                  <TouchableOpacity
                    onPress={() => handleTerminateSession(item.id)}
                    className="ml-2 p-2"
                  >
                    <Trash size={20} color="#FF1A4B" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-6 mt-20">
              <Desktop size={64} color="#6B7280" weight="thin" />
              <Text className="text-text-muted text-base mt-4 text-center">
                Нет активных сессий
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

