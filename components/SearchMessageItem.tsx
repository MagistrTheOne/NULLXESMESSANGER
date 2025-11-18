import { getUserById } from "@/lib/api/db";
import { formatTime } from "@/lib/utils/format";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ChatText } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface SearchMessageItemProps {
  item: any;
  searchQuery: string;
}

export function SearchMessageItem({ item, searchQuery }: SearchMessageItemProps) {
  const router = useRouter();
  const [senderName, setSenderName] = useState<string>("");

  useEffect(() => {
    loadMessageDetails();
  }, [item]);

  const loadMessageDetails = async () => {
    try {
      const sender = await getUserById(item.userId);
      setSenderName(sender?.name || "Неизвестно");
    } catch (error) {
      console.error("Error loading message details:", error);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi"));
    return (
      <Text>
        {parts.map((part, index) => (
          <Text
            key={index}
            className={part.toLowerCase() === query.toLowerCase() ? "bg-accent/50 font-semibold" : ""}
          >
            {part}
          </Text>
        ))}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      onPress={() => {
        router.push(`/(main)/chat/${item.chatId}` as any);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      className="bg-secondary/40 border border-accent/10 rounded-xl p-4 mb-2 mx-4"
      activeOpacity={0.8}
    >
      <View className="flex-row items-center mb-2">
        <ChatText size={16} color="#00b7ff" />
        <Text className="text-text-secondary text-xs ml-2">
          {senderName} • {formatTime(item.createdAt)}
        </Text>
      </View>
      <Text className="text-text-primary text-base">
        {highlightText(item.content, searchQuery)}
      </Text>
    </TouchableOpacity>
  );
}


