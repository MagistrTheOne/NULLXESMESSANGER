import { createStory } from "@/lib/api/db";
import { useAuthStore } from "@/stores/authStore";
import { Video } from "expo-av";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ArrowLeft, Camera, Image as ImageIcon } from "phosphor-react-native";
import React, { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

export default function CreateStoryScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [selectedMedia, setSelectedMedia] = useState<{ uri: string; type: "image" | "video" } | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePickMedia = async (type: "image" | "video") => {
    try {
      const permission = type === "image"
        ? await ImagePicker.requestMediaLibraryPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Ошибка", "Нужно разрешение на доступ к медиа");
        return;
      }

      const result = type === "image"
        ? await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [9, 16],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            aspect: [9, 16],
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        setSelectedMedia({
          uri: result.assets[0].uri,
          type,
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error("Error picking media:", error);
      Alert.alert("Ошибка", "Не удалось выбрать медиа");
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Ошибка", "Нужно разрешение на доступ к камере");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedMedia({
          uri: result.assets[0].uri,
          type: "image",
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Ошибка", "Не удалось сделать фото");
    }
  };

  const handlePublish = async () => {
    if (!selectedMedia || !user?.id) return;

    setLoading(true);
    try {
      await createStory(user.id, selectedMedia.uri, selectedMedia.type);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error("Error creating story:", error);
      Alert.alert("Ошибка", "Не удалось опубликовать историю");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
        <Text className="text-text-primary text-lg font-semibold flex-1">Новая история</Text>
        {selectedMedia && (
          <TouchableOpacity
            onPress={handlePublish}
            disabled={loading}
            className="bg-accent px-4 py-2 rounded-full"
          >
            <Text className="text-white font-semibold">Опубликовать</Text>
          </TouchableOpacity>
        )}
      </View>

      {selectedMedia ? (
        <View className="flex-1 items-center justify-center">
          {selectedMedia.type === "image" ? (
            <Image
              source={{ uri: selectedMedia.uri }}
              style={{ width: "100%", height: "70%", resizeMode: "contain" }}
            />
          ) : (
            <Video
              source={{ uri: selectedMedia.uri }}
              style={{ width: "100%", height: "70%" }}
              useNativeControls
            />
          )}
          <TouchableOpacity
            onPress={() => setSelectedMedia(null)}
            className="mt-4 bg-danger/20 px-6 py-3 rounded-full"
          >
            <Text className="text-danger">Выбрать другое</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <View className="flex-row gap-4 mb-8">
            <TouchableOpacity
              onPress={() => handlePickMedia("image")}
              className="bg-secondary/60 p-6 rounded-2xl items-center"
            >
              <ImageIcon size={48} color="#00B7FF" />
              <Text className="text-text-primary mt-4 font-semibold">Фото</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handlePickMedia("video")}
              className="bg-secondary/60 p-6 rounded-2xl items-center"
            >
              <Camera size={48} color="#00B7FF" />
              <Text className="text-text-primary mt-4 font-semibold">Видео</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleTakePhoto}
            className="bg-accent px-8 py-4 rounded-full"
          >
            <Text className="text-white font-semibold text-lg">Сделать фото</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

