import { Archive, Trash } from "phosphor-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { ChatListItem } from "./ChatListItem";

interface SwipeableChatListItemProps {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  time?: string;
  unreadCount?: number;
  isPinned?: boolean;
  isRead?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

export function SwipeableChatListItem({
  onArchive,
  onDelete,
  ...props
}: SwipeableChatListItemProps) {
  const swipeableRef = React.useRef<Swipeable>(null);

  const renderRightActions = () => {
    return (
      <View className="flex-row items-center" style={{ width: 160 }}>
        {onArchive && (
          <TouchableOpacity
            onPress={() => {
              swipeableRef.current?.close();
              onArchive();
            }}
            className="flex-1 bg-accent/20 items-center justify-center"
            style={{ height: "100%" }}
          >
            <View className="items-center">
              <Archive size={24} color="#00B7FF" weight="fill" />
              <Text className="text-accent text-xs mt-1">Архив</Text>
            </View>
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity
            onPress={() => {
              swipeableRef.current?.close();
              onDelete();
            }}
            className="flex-1 bg-danger/20 items-center justify-center"
            style={{ height: "100%" }}
          >
            <View className="items-center">
              <Trash size={24} color="#FF1A4B" weight="fill" />
              <Text className="text-danger text-xs mt-1">Удалить</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <ChatListItem {...props} />
    </Swipeable>
  );
}

