import { Check, PushPin } from "phosphor-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Avatar } from "./ui/Avatar";
import { Badge } from "./ui/Badge";

interface ChatListItemProps {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  time?: string;
  unreadCount?: number;
  isPinned?: boolean;
  isRead?: boolean;
  onlineStatus?: "online" | "offline" | "recently";
  onPress: () => void;
  onLongPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function ChatListItem({
  name,
  avatar,
  lastMessage,
  time,
  unreadCount = 0,
  isPinned = false,
  isRead = true,
  onlineStatus,
  onPress,
  onLongPress,
}: ChatListItemProps) {
  const getStatusColor = () => {
    switch (onlineStatus) {
      case "online":
        return "#00FF00";
      case "recently":
        return "#FFA500";
      default:
        return undefined;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-row items-center px-4 py-3 bg-secondary/40 active:bg-secondary/60"
      activeOpacity={0.7}
    >
      <View className="relative">
        <Avatar uri={avatar} name={name} size={56} showBorder={unreadCount > 0} />
        {onlineStatus && onlineStatus !== "offline" && (
          <View
            className="absolute bottom-0 right-0 rounded-full border-2 border-primary"
            style={{
              width: 16,
              height: 16,
              backgroundColor: getStatusColor(),
            }}
          />
        )}
      </View>
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-text-primary font-semibold text-base flex-1" numberOfLines={1}>
            {name}
          </Text>
          {time && (
            <Text className="text-text-muted text-xs ml-2">{time}</Text>
          )}
        </View>
        <View className="flex-row items-center">
          {isPinned && (
            <View className="mr-1">
              <PushPin size={14} color="#00B7FF" weight="fill" />
            </View>
          )}
          <View className="mr-1">
            {isRead ? (
              <Check size={16} color="#00B7FF" weight="fill" />
            ) : (
              <Check size={16} color="#6B7280" />
            )}
          </View>
          <Text className="text-text-secondary text-sm flex-1" numberOfLines={1}>
            {lastMessage || "Нет сообщений"}
          </Text>
        </View>
      </View>
      {unreadCount > 0 && (
        <View className="ml-2">
          <Badge count={unreadCount} />
        </View>
      )}
    </TouchableOpacity>
  );
}

