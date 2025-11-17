import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Camera, Pencil } from "phosphor-react-native";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/stores/authStore";
import { updateUser } from "@/lib/api/db";
import { showImagePickerOptions } from "@/lib/utils/imagePicker";

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [name, setName] = useState(user?.name || "");
  const [status, setStatus] = useState(user?.status || "");
  const [loading, setLoading] = useState(false);

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
          <Text className="text-text-primary text-base font-semibold mb-4">Управление устройствами</Text>
          <TouchableOpacity className="py-3 border-b border-accent/10">
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

