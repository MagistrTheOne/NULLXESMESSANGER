import { useRouter } from "expo-router";
import { Paperclip } from "phosphor-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface FileMessageProps {
  uri: string;
  isOwn: boolean;
  messageId?: string;
  chatId?: string;
}

export function FileMessage({ uri, isOwn, messageId, chatId }: FileMessageProps) {
  const router = useRouter();

  const handlePress = () => {
    if (messageId && chatId) {
      router.push(`/(main)/chat/${chatId}/document?messageId=${messageId}` as any);
    }
  };

  const filename = uri.split("/").pop() || "Файл";

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex-row items-center bg-secondary/40 px-4 py-3 rounded-lg mt-2"
      activeOpacity={0.8}
    >
      <Paperclip size={24} color={isOwn ? "#FFFFFF" : "#00b7ff"} weight="fill" />
      <View className="flex-1 ml-3">
        <Text className={`text-sm font-semibold ${isOwn ? "text-white" : "text-text-primary"}`} numberOfLines={1}>
          {filename}
        </Text>
        <Text className={`text-xs mt-1 ${isOwn ? "text-white/70" : "text-text-muted"}`}>
          Нажмите для просмотра
        </Text>
      </View>
    </TouchableOpacity>
  );
}

