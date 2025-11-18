import { getMessageById } from "@/lib/api/db";
import { formatTime } from "@/lib/utils/format";
import { useAuthStore } from "@/stores/authStore";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import { ArrowLeft, Download, File, FilePdf, FileText, Paperclip, Share } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function DocumentViewerScreen() {
  const { messageId } = useLocalSearchParams<{ messageId: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [message, setMessage] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (messageId) {
      loadMessage();
    }
  }, [messageId]);

  const loadMessage = async () => {
    if (!messageId) return;
    setLoading(true);
    try {
      const msg = await getMessageById(messageId);
      setMessage(msg);
    } catch (error) {
      console.error("Error loading message:", error);
      Alert.alert("Ошибка", "Не удалось загрузить документ");
    } finally {
      setLoading(false);
    }
  };

  const getFileExtension = (uri: string): string => {
    const parts = uri.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  };

  const getFileType = (uri: string): "pdf" | "text" | "other" => {
    const ext = getFileExtension(uri);
    if (ext === "pdf") return "pdf";
    if (["txt", "md", "json", "xml", "csv"].includes(ext)) return "text";
    return "other";
  };

  const handleOpenInBrowser = async () => {
    if (!message?.content) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // For PDF, use Google Docs Viewer
      if (getFileType(message.content) === "pdf") {
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(message.content)}&embedded=true`;
        await WebBrowser.openBrowserAsync(viewerUrl);
      } else {
        // For other files, try to open directly
        const canOpen = await Linking.canOpenURL(message.content);
        if (canOpen) {
          await Linking.openURL(message.content);
        } else {
          Alert.alert("Ошибка", "Не удалось открыть файл");
        }
      }
    } catch (error: any) {
      console.error("Error opening file:", error);
      Alert.alert("Ошибка", error.message || "Не удалось открыть файл");
    }
  };

  const handleDownload = async () => {
    if (!message?.content) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const fileUri = message.content;
      const filename = fileUri.split("/").pop() || `file_${message.id}`;
      const documentDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || "";
      const downloadPath = `${documentDir}${filename}`;

      const downloadResult = await FileSystem.downloadAsync(fileUri, downloadPath);

      if (downloadResult.status === 200) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Успешно", `Файл сохранен: ${filename}`);
      } else {
        throw new Error("Ошибка загрузки файла");
      }
    } catch (error: any) {
      console.error("Error downloading file:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Ошибка", error.message || "Не удалось скачать файл");
    }
  };

  const handleShare = async () => {
    if (!message?.content) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Ошибка", "Поделиться недоступно на этом устройстве");
        return;
      }

      const fileUri = message.content;
      const filename = fileUri.split("/").pop() || `file_${message.id}`;
      const documentDir = (FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory || "";
      const downloadPath = `${documentDir}${filename}`;

      const downloadResult = await FileSystem.downloadAsync(fileUri, downloadPath);

      if (downloadResult.status === 200) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: "application/octet-stream",
          dialogTitle: "Поделиться файлом",
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        throw new Error("Ошибка загрузки файла");
      }
    } catch (error: any) {
      console.error("Error sharing file:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Ошибка", error.message || "Не удалось поделиться файлом");
    }
  };

  const renderFileIcon = () => {
    if (!message?.content) return null;

    const fileType = getFileType(message.content);
    const ext = getFileExtension(message.content);

    if (fileType === "pdf") {
      return <FilePdf size={80} color="#00b7ff" weight="fill" />;
    } else if (fileType === "text") {
      return <FileText size={80} color="#00b7ff" weight="fill" />;
    } else {
      return <File size={80} color="#00b7ff" weight="fill" />;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <Text className="text-text-secondary">Загрузка документа...</Text>
      </View>
    );
  }

  if (!message) {
    return (
      <View className="flex-1 bg-primary items-center justify-center px-6">
        <Paperclip size={64} color="#6B7280" weight="thin" />
        <Text className="text-text-muted text-base mt-4 text-center">
          Документ не найден
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-accent px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filename = message.content.split("/").pop() || "Файл";
  const fileType = getFileType(message.content);
  const ext = getFileExtension(message.content);

  return (
    <View className="flex-1 bg-primary">
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-text-primary text-lg font-semibold" numberOfLines={1}>
              {filename}
            </Text>
            <Text className="text-text-secondary text-xs mt-1">
              {formatTime(message.createdAt)} • {ext.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleShare}
            className="ml-2 p-2"
          >
            <Share size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDownload}
            className="ml-2 p-2"
          >
            <Download size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        <View className="items-center justify-center" style={{ minHeight: SCREEN_HEIGHT - 200 }}>
          {renderFileIcon()}
          <Text className="text-text-primary text-xl font-semibold mt-6 text-center" numberOfLines={2}>
            {filename}
          </Text>
          <Text className="text-text-secondary text-sm mt-2">
            {ext.toUpperCase()} файл
          </Text>
          <Text className="text-text-secondary text-xs mt-1">
            {formatTime(message.createdAt)}
          </Text>

          <TouchableOpacity
            onPress={handleOpenInBrowser}
            className="mt-8 bg-accent px-8 py-4 rounded-xl flex-row items-center"
            activeOpacity={0.8}
          >
            <FilePdf size={20} color="#FFFFFF" weight="fill" />
            <Text className="text-white font-semibold ml-2">
              {fileType === "pdf" ? "Открыть в браузере" : "Открыть файл"}
            </Text>
          </TouchableOpacity>

          <Text className="text-text-muted text-xs mt-6 text-center px-6">
            {fileType === "pdf" 
              ? "PDF файлы можно открыть в браузере для просмотра"
              : "Для просмотра файла используйте соответствующее приложение"}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

