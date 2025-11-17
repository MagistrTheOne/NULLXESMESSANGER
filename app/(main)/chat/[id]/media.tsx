import { getChatMedia } from "@/lib/api/db";
import { formatTime } from "@/lib/utils/format";
import { useAuthStore } from "@/stores/authStore";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Download, Image as ImageIcon, Paperclip, Video } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, FlatList, Image, Modal, Text, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_SIZE = (SCREEN_WIDTH - 48) / 3; // 3 columns with padding

export default function ChatMediaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [filter, setFilter] = useState<"all" | "images" | "videos" | "files">("all");

  useEffect(() => {
    if (id) {
      loadMedia();
    }
  }, [id, filter]);

  const loadMedia = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const allMedia = await getChatMedia(id);
      let filtered = allMedia;

      if (filter === "images") {
        filtered = allMedia.filter((m) => m.type === "image");
      } else if (filter === "videos") {
        filtered = allMedia.filter((m) => m.type === "video");
      } else if (filter === "files") {
        filtered = allMedia.filter((m) => m.type === "file");
      }

      setMedia(filtered);
    } catch (error) {
      console.error("Error loading media:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaPress = (item: any) => {
    setSelectedMedia(item);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDownload = async (item: any) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (item.type === "image" || item.type === "video") {
        // Request media library permissions
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Ошибка", "Необходимо разрешение на доступ к медиатеке");
          return;
        }

        // Download file to cache
        const fileUri = item.content;
        const filename = fileUri.split("/").pop() || `media_${item.id}.${item.type === "image" ? "jpg" : "mp4"}`;
        const documentDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || "";
        const downloadPath = `${documentDir}${filename}`;

        const downloadResult = await FileSystem.downloadAsync(fileUri, downloadPath);

        if (downloadResult.status === 200) {
          // Save to media library
          const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
          await MediaLibrary.createAlbumAsync("NULLXES", asset, false);

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert("Успешно", "Медиа сохранено в галерею");
        } else {
          throw new Error("Ошибка загрузки файла");
        }
      } else if (item.type === "file") {
        // For files, download to documents directory
        const fileUri = item.content;
        const filename = fileUri.split("/").pop() || `file_${item.id}`;
        const documentDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || "";
        const downloadPath = `${documentDir}${filename}`;

        const downloadResult = await FileSystem.downloadAsync(fileUri, downloadPath);

        if (downloadResult.status === 200) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert("Успешно", `Файл сохранен: ${filename}`);
        } else {
          throw new Error("Ошибка загрузки файла");
        }
      }
    } catch (error: any) {
      console.error("Error downloading media:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Ошибка", error.message || "Не удалось скачать медиа");
    }
  };

  const renderMediaItem = ({ item }: { item: any }) => {
    const isImage = item.type === "image";
    const isVideo = item.type === "video";
    const isFile = item.type === "file";

    return (
      <TouchableOpacity
        onPress={() => handleMediaPress(item)}
        className="bg-secondary/40 border border-accent/10 rounded-lg overflow-hidden m-1"
        style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
        activeOpacity={0.8}
      >
        {isImage && (
          <Image
            source={{ uri: item.content }}
            className="w-full h-full"
            resizeMode="cover"
          />
        )}
        {isVideo && (
          <View className="w-full h-full bg-secondary/60 items-center justify-center">
            <Video size={32} color="#00b7ff" weight="fill" />
            <View className="absolute bottom-2 right-2 bg-black/60 rounded px-1">
              <Text className="text-white text-xs">VID</Text>
            </View>
          </View>
        )}
        {isFile && (
          <View className="w-full h-full bg-secondary/60 items-center justify-center">
            <Paperclip size={32} color="#00b7ff" weight="fill" />
            <View className="absolute bottom-2 left-2 right-2">
              <Text className="text-text-primary text-xs text-center" numberOfLines={1}>
                {item.content.split("/").pop() || "File"}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFullScreenModal = () => {
    if (!selectedMedia) return null;

    const isImage = selectedMedia.type === "image";
    const isVideo = selectedMedia.type === "video";
    const isFile = selectedMedia.type === "file";

    return (
      <Modal
        visible={!!selectedMedia}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMedia(null)}
      >
        <View className="flex-1 bg-black/95">
          <View className="pt-12 pb-4 px-4 bg-black/60 border-b border-accent/10 flex-row items-center">
            <TouchableOpacity
              onPress={() => setSelectedMedia(null)}
              className="mr-4"
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-text-primary text-lg font-semibold flex-1" numberOfLines={1}>
              {isFile ? selectedMedia.content.split("/").pop() : "Медиа"}
            </Text>
            <TouchableOpacity
              onPress={() => handleDownload(selectedMedia)}
              className="ml-2 p-2"
            >
              <Download size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 items-center justify-center p-4">
            {isImage && (
              <Image
                source={{ uri: selectedMedia.content }}
                className="w-full h-full"
                resizeMode="contain"
              />
            )}
            {isVideo && (
              <View className="w-full h-full bg-black items-center justify-center">
                <Video size={64} color="#00b7ff" weight="fill" />
                <Text className="text-text-primary text-base mt-4">
                  Видео: {selectedMedia.content.split("/").pop()}
                </Text>
                <Text className="text-text-secondary text-sm mt-2">
                  {formatTime(selectedMedia.createdAt)}
                </Text>
              </View>
            )}
            {isFile && (
              <View className="w-full items-center justify-center">
                <Paperclip size={64} color="#00b7ff" weight="fill" />
                <Text className="text-text-primary text-lg mt-4 text-center" numberOfLines={2}>
                  {selectedMedia.content.split("/").pop()}
                </Text>
                <Text className="text-text-secondary text-sm mt-2">
                  {formatTime(selectedMedia.createdAt)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <Text className="text-text-secondary">Загрузка медиа...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-text-primary text-lg font-semibold flex-1">
            Медиа
          </Text>
        </View>

        <View className="flex-row gap-2">
          {(["all", "images", "videos", "files"] as const).map((filterType) => (
            <TouchableOpacity
              key={filterType}
              onPress={() => {
                setFilter(filterType);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className={`px-4 py-2 rounded-lg ${
                filter === filterType
                  ? "bg-accent"
                  : "bg-secondary/60 border border-accent/10"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  filter === filterType ? "text-white" : "text-text-secondary"
                }`}
              >
                {filterType === "all" && "Все"}
                {filterType === "images" && "Фото"}
                {filterType === "videos" && "Видео"}
                {filterType === "files" && "Файлы"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {media.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <ImageIcon size={64} color="#6B7280" weight="thin" />
          <Text className="text-text-muted text-base mt-4 text-center">
            Медиа не найдено
          </Text>
        </View>
      ) : (
        <FlatList
          data={media}
          keyExtractor={(item) => item.id}
          renderItem={renderMediaItem}
          numColumns={3}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {renderFullScreenModal()}
    </View>
  );
}

