import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { updateUser } from "@/lib/api/db";
import { showImagePickerOptions } from "@/lib/utils/imagePicker";
import { useAuthStore } from "@/stores/authStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ArrowLeft, Camera, X } from "phosphor-react-native";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ProfileEditScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [name, setName] = useState(user?.name || "");
  const [status, setStatus] = useState(user?.status || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar);

  const handleSave = async () => {
    if (!user?.id) return;

    if (!name.trim()) {
      Alert.alert("Ошибка", "Имя не может быть пустым");
      return;
    }

    if (name.length > 50) {
      Alert.alert("Ошибка", "Имя слишком длинное (максимум 50 символов)");
      return;
    }

    if (status.length > 100) {
      Alert.alert("Ошибка", "Статус слишком длинный (максимум 100 символов)");
      return;
    }

    setLoading(true);
    try {
      const updated = await updateUser(user.id, {
        name: name.trim(),
        status: status.trim() || undefined,
        avatar: avatar || undefined,
      });
      setUser({
        ...user,
        name: updated.name || undefined,
        status: updated.status || undefined,
        avatar: updated.avatar || undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Ошибка", "Не удалось обновить профиль");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeAvatar = async () => {
    const imageUri = await showImagePickerOptions();
    if (imageUri) {
      setAvatar(imageUri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(undefined);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View className="flex-1 bg-primary">
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-text-primary text-lg font-semibold flex-1">Редактирование профиля</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="bg-accent px-4 py-2 rounded-full"
        >
          <Text className="text-white font-semibold">{loading ? "Сохранение..." : "Сохранить"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <View className="items-center mb-6">
          <View className="relative">
            <Avatar uri={avatar} name={name || user?.phone} size={120} showBorder />
            <TouchableOpacity
              onPress={handleChangeAvatar}
              className="absolute bottom-0 right-0 bg-accent rounded-full p-3 border-2 border-primary"
              activeOpacity={0.8}
            >
              <Camera size={20} color="#FFFFFF" />
            </TouchableOpacity>
            {avatar && (
              <TouchableOpacity
                onPress={handleRemoveAvatar}
                className="absolute top-0 right-0 bg-danger rounded-full p-2 border-2 border-primary"
                activeOpacity={0.8}
              >
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Card className="p-4 mb-4">
          <Input
            label="Имя"
            value={name}
            onChangeText={setName}
            placeholder="Введите имя"
            maxLength={50}
          />
          <Text className="text-text-muted text-xs mt-1">{name.length}/50</Text>
        </Card>

        <Card className="p-4 mb-4">
          <Input
            label="Статус"
            value={status}
            onChangeText={setStatus}
            placeholder="Введите статус"
            maxLength={100}
            multiline
            numberOfLines={3}
          />
          <Text className="text-text-muted text-xs mt-1">{status.length}/100</Text>
        </Card>

        <Card className="p-4 mb-4">
          <Text className="text-text-secondary text-sm mb-2">Телефон</Text>
          <View className="bg-secondary/60 rounded-xl px-4 py-3">
            <Text className="text-text-primary">{phone}</Text>
          </View>
          <Text className="text-text-muted text-xs mt-2">Телефон нельзя изменить</Text>
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


