import { addFavorite, addMessageReaction, getMessageReactions, getUserFavorites, isMessageFavorite, removeFavorite, removeMessageReaction } from "@/lib/api/db";
import { useAuthStore } from "@/stores/authStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import * as Haptics from "expo-haptics";
import { ArrowRight, Check, Pencil, Smiley, Star, Trash } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { EmojiPicker } from "./EmojiPicker";
import { VoiceMessage } from "./VoiceMessage";

interface MessageBubbleProps {
  text: string;
  isOwn: boolean;
  time?: string;
  isRead?: boolean;
  reactions?: string[];
  imageUri?: string;
  type?: "text" | "image" | "voice" | "video" | "file";
  messageId?: string;
  chatId?: string;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string, deleteForEveryone: boolean) => void;
  onForward?: (messageId: string) => void;
}

export function MessageBubble({
  text,
  isOwn,
  time,
  isRead = false,
  reactions,
  imageUri,
  type = "text",
  messageId,
  chatId,
  onEdit,
  onDelete,
  onForward,
}: MessageBubbleProps) {
  const user = useAuthStore((state) => state.user);
  const { isFavorite: isFavoriteInStore, addFavorite: addToStore, removeFavorite: removeFromStore } = useFavoritesStore();
  const [isFav, setIsFav] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageReactions, setMessageReactions] = useState<any[]>([]);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (messageId && user?.id) {
      checkFavorite();
      loadReactions();
    }
  }, [messageId, user?.id]);

  const loadReactions = async () => {
    if (!messageId) return;
    try {
      const reactions = await getMessageReactions(messageId);
      setMessageReactions(reactions);
    } catch (error) {
      console.error("Error loading reactions:", error);
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!messageId || !user?.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const existing = messageReactions.find((r) => r.userId === user.id);
      if (existing) {
        if (existing.emoji === emoji) {
          await removeMessageReaction(messageId, user.id);
        } else {
          await addMessageReaction(messageId, user.id, emoji);
        }
      } else {
        await addMessageReaction(messageId, user.id, emoji);
      }
      await loadReactions();
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const handleLongPress = () => {
    if (!messageId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowActions(true);
  };

  const handleDelete = () => {
    if (!messageId || !onDelete) return;
    Alert.alert(
      "Удалить сообщение?",
      "Выберите действие",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить для меня",
          onPress: () => {
            onDelete(messageId, false);
            setShowActions(false);
          },
        },
        {
          text: "Удалить для всех",
          style: "destructive",
          onPress: () => {
            onDelete(messageId, true);
            setShowActions(false);
          },
        },
      ]
    );
  };

  const checkFavorite = async () => {
    if (!messageId || !user?.id) return;
    try {
      const favorite = await isMessageFavorite(user.id, messageId);
      setIsFav(favorite);
    } catch (error) {
      console.error("Error checking favorite:", error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!messageId || !user?.id || !chatId) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isFav) {
        const favorites = await getUserFavorites(user.id, "message");
        const favorite = favorites.find((f) => f.messageId === messageId);
        if (favorite) {
          await removeFavorite(favorite.id);
          removeFromStore(favorite.id);
        }
        setIsFav(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        const favoriteType = type === "image" || type === "video" ? "media" : "message";
        const metadata = imageUri ? { uri: imageUri } : undefined;
        const favorite = await addFavorite(
          user.id,
          favoriteType,
          messageId,
          chatId,
          text || undefined,
          metadata
        );
        addToStore({
          userId: user.id,
          type: favoriteType,
          messageId,
          chatId,
          content: text || undefined,
          metadata,
        });
        setIsFav(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handlePressOut = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <View className={`flex-row ${isOwn ? "justify-end" : "justify-start"} mb-2 px-4`}>
      <View className="relative">
        <TouchableOpacity
          className={`max-w-[75%] rounded-2xl px-4 py-2 ${
            isOwn
              ? "bg-accent"
              : "bg-secondary/60 border border-accent/10"
          }`}
          style={isOwn ? { borderBottomRightRadius: 4 } : { borderBottomLeftRadius: 4 }}
          onLongPress={handleLongPress}
          activeOpacity={0.9}
        >
        {type === "image" && imageUri && (
          <TouchableOpacity className="mb-2 rounded-xl overflow-hidden">
            <Image
              source={{ uri: imageUri }}
              style={{ width: 250, height: 250 }}
              className="rounded-xl"
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        {type === "voice" && (
          <VoiceMessage uri={text} isOwn={isOwn} />
        )}
        {text && type !== "voice" && (
          <Text className={`text-base ${isOwn ? "text-white" : "text-text-primary"}`}>
            {text}
          </Text>
        )}
        <View className="flex-row items-center justify-end mt-1">
          {messageId && (
            <TouchableOpacity
              onPress={handleToggleFavorite}
              className="mr-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Star
                size={16}
                color={isFav ? "#FFD700" : isOwn ? "#FFFFFF" : "#6B7280"}
                weight={isFav ? "fill" : "regular"}
              />
            </TouchableOpacity>
          )}
          {time && (
            <Text className={`text-xs mr-1 ${isOwn ? "text-white/70" : "text-text-muted"}`}>
              {time}
            </Text>
          )}
          {isOwn && (
            isRead ? (
              <Check size={14} color="#FFFFFF" weight="fill" />
            ) : (
              <Check size={14} color="#FFFFFF" />
            )
          )}
        </View>
        {messageReactions.length > 0 && (
          <View className="flex-row flex-wrap mt-2 gap-1">
            {Array.from(new Set(messageReactions.map((r) => r.emoji))).map((emoji, idx) => {
              const count = messageReactions.filter((r) => r.emoji === emoji).length;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleReaction(emoji)}
                  className="bg-secondary/60 px-2 py-1 rounded-full flex-row items-center"
                >
                  <Text className="text-sm mr-1">{emoji}</Text>
                  {count > 1 && <Text className="text-xs text-text-secondary">{count}</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        </TouchableOpacity>

      {showActions && (
        <View className="absolute top-full left-0 mt-2 bg-secondary border border-accent/20 rounded-xl p-2 z-50">
          <TouchableOpacity
            onPress={() => {
              setShowEmojiPicker(true);
              setShowActions(false);
            }}
            className="flex-row items-center px-4 py-2"
          >
            <Smiley size={20} color="#FFFFFF" />
            <Text className="text-text-primary ml-2">Реакция</Text>
          </TouchableOpacity>
          {isOwn && onEdit && (
            <TouchableOpacity
              onPress={() => {
                onEdit(messageId!);
                setShowActions(false);
              }}
              className="flex-row items-center px-4 py-2"
            >
              <Pencil size={20} color="#FFFFFF" />
              <Text className="text-text-primary ml-2">Редактировать</Text>
            </TouchableOpacity>
          )}
          {onForward && (
            <TouchableOpacity
              onPress={() => {
                onForward(messageId!);
                setShowActions(false);
              }}
              className="flex-row items-center px-4 py-2"
            >
              <ArrowRight size={20} color="#FFFFFF" />
              <Text className="text-text-primary ml-2">Переслать</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              className="flex-row items-center px-4 py-2"
            >
              <Trash size={20} color="#FF1A4B" />
              <Text className="text-danger ml-2">Удалить</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {showEmojiPicker && (
        <View className="absolute bottom-full left-0 mb-2">
          <EmojiPicker
            onSelect={handleReaction}
            onClose={() => setShowEmojiPicker(false)}
          />
        </View>
      )}
      </View>
    </View>
  );
}

