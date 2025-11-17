import { NeonGlow } from "@/components/NeonGlow";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { getUserById, getUserStats, updateUser, updateUserOnlineStatus } from "@/lib/api/db";
import { showImagePickerOptions } from "@/lib/utils/imagePicker";
import { useAuthStore } from "@/stores/authStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ArrowLeft, Bookmark, Camera, ChatCircle, ChatText, Circle, Image as ImageIcon } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [name, setName] = useState(user?.name || "");
  const [status, setStatus] = useState(user?.status || "");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    chatsCount: 0,
    messagesCount: 0,
    mediaCount: 0,
    favoritesCount: 0,
  });
  const [onlineStatus, setOnlineStatus] = useState<"online" | "offline" | "recently">("offline");

  useEffect(() => {
    if (user?.id) {
      loadStats();
      loadOnlineStatus();
    }
  }, [user?.id]);

  const loadOnlineStatus = async () => {
    if (!user?.id) return;
    const userData = await getUserById(user.id);
    if (userData?.onlineStatus) {
      setOnlineStatus(userData.onlineStatus as "online" | "offline" | "recently");
    }
  };

  const handleStatusChange = async (status: "online" | "offline" | "recently") => {
    if (!user?.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await updateUserOnlineStatus(user.id, status);
      setOnlineStatus(status);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error updating online status:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const loadStats = async () => {
    if (!user?.id) return;
    try {
      const userStats = await getUserStats(user.id);
      setStats(userStats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const updated = await updateUser(user.id, { name, status });
      setUser({
        ...user,
        name: updated.name || undefined,
        status: updated.status || undefined,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeAvatar = async () => {
    if (!user?.id) return;
    
    const imageUri = await showImagePickerOptions();
    if (!imageUri) return;

    setLoading(true);
    try {
      const updated = await updateUser(user.id, { avatar: imageUri });
      setUser({
        ...user,
        avatar: updated.avatar || undefined,
      });
    } catch (error) {
      console.error("Error updating avatar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-primary">
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-text-primary text-lg font-semibold">Профиль</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <View className="items-center mb-6">
          <View className="relative">
            <Avatar uri={user?.avatar} name={user?.name || user?.phone} size={100} showBorder />
            <TouchableOpacity
              onPress={handleChangeAvatar}
              className="absolute bottom-0 right-0 bg-accent rounded-full p-2 border-2 border-primary"
              activeOpacity={0.8}
            >
              <Camera size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text className="text-text-primary text-xl font-bold mt-4">{user?.name || "Пользователь"}</Text>
          <Text className="text-text-muted text-sm mt-1">{user?.phone}</Text>
        </View>

        <Card className="p-4 mb-4">
          <Input
            label="Имя"
            value={name}
            onChangeText={setName}
            placeholder="Введите имя"
          />
          <Input
            label="Статус"
            value={status}
            onChangeText={setStatus}
            placeholder="Введите статус"
          />
        </Card>

        <Card className="p-4 mb-4">
          <Text className="text-text-primary text-base font-semibold mb-4">Статистика аккаунта</Text>
          <View className="flex-row flex-wrap">
            <View className="w-1/2 mb-4">
              <NeonGlow color="blue" intensity="low">
                <View className="bg-secondary/40 rounded-xl p-4 items-center">
                  <ChatCircle size={32} color="#00B7FF" weight="fill" />
                  <Text className="text-text-primary text-2xl font-bold mt-2">{stats.chatsCount}</Text>
                  <Text className="text-text-secondary text-xs mt-1">Чатов</Text>
                </View>
              </NeonGlow>
            </View>
            <View className="w-1/2 mb-4">
              <NeonGlow color="blue" intensity="low">
                <View className="bg-secondary/40 rounded-xl p-4 items-center">
                  <ChatText size={32} color="#00B7FF" weight="fill" />
                  <Text className="text-text-primary text-2xl font-bold mt-2">{stats.messagesCount}</Text>
                  <Text className="text-text-secondary text-xs mt-1">Сообщений</Text>
                </View>
              </NeonGlow>
            </View>
            <View className="w-1/2">
              <NeonGlow color="blue" intensity="low">
                <View className="bg-secondary/40 rounded-xl p-4 items-center">
                  <ImageIcon size={32} color="#00B7FF" weight="fill" />
                  <Text className="text-text-primary text-2xl font-bold mt-2">{stats.mediaCount}</Text>
                  <Text className="text-text-secondary text-xs mt-1">Медиа</Text>
                </View>
              </NeonGlow>
            </View>
            <View className="w-1/2">
              <NeonGlow color="blue" intensity="low">
                <View className="bg-secondary/40 rounded-xl p-4 items-center">
                  <Bookmark size={32} color="#00B7FF" weight="fill" />
                  <Text className="text-text-primary text-2xl font-bold mt-2">{stats.favoritesCount}</Text>
                  <Text className="text-text-secondary text-xs mt-1">Избранное</Text>
                </View>
              </NeonGlow>
            </View>
          </View>
        </Card>

        <Card className="p-4 mb-4">
          <Text className="text-text-primary text-base font-semibold mb-4">Статус</Text>
          <View className="flex-row gap-2 mb-3">
            <TouchableOpacity
              onPress={() => handleStatusChange("online")}
              className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${
                onlineStatus === "online" ? "bg-accent/20 border border-accent" : "bg-secondary/60"
              }`}
            >
              <Circle size={12} color={onlineStatus === "online" ? "#00FF00" : "#6B7280"} weight="fill" />
              <Text className={`text-sm ml-2 ${onlineStatus === "online" ? "text-accent font-semibold" : "text-text-secondary"}`}>
                Онлайн
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleStatusChange("recently")}
              className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${
                onlineStatus === "recently" ? "bg-accent/20 border border-accent" : "bg-secondary/60"
              }`}
            >
              <Circle size={12} color={onlineStatus === "recently" ? "#FFA500" : "#6B7280"} weight="fill" />
              <Text className={`text-sm ml-2 ${onlineStatus === "recently" ? "text-accent font-semibold" : "text-text-secondary"}`}>
                Недавно
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleStatusChange("offline")}
              className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${
                onlineStatus === "offline" ? "bg-accent/20 border border-accent" : "bg-secondary/60"
              }`}
            >
              <Circle size={12} color={onlineStatus === "offline" ? "#6B7280" : "#6B7280"} weight="fill" />
              <Text className={`text-sm ml-2 ${onlineStatus === "offline" ? "text-accent font-semibold" : "text-text-secondary"}`}>
                Офлайн
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card className="p-4 mb-4">
          <Text className="text-text-primary text-base font-semibold mb-4">Управление устройствами</Text>
          <TouchableOpacity
            onPress={() => router.push("/profile/sessions" as any)}
            className="py-3 border-b border-accent/10"
          >
            <Text className="text-text-secondary">Активные сессии</Text>
          </TouchableOpacity>
        </Card>

        <Card className="p-4 mb-4">
          <Text className="text-text-primary text-base font-semibold mb-4">Приватность</Text>
          <TouchableOpacity className="py-3 border-b border-accent/10">
            <Text className="text-text-secondary">Настройки приватности</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-3">
            <Text className="text-text-secondary">Блокированные пользователи</Text>
          </TouchableOpacity>
        </Card>

        <Button
          title="Сохранить изменения"
          onPress={handleSave}
          loading={loading}
          className="mt-4"
        />
      </ScrollView>
    </View>
  );
}

