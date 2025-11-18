import { getUserStories, replyToStory, viewStory } from "@/lib/api/db";
import { useAuthStore } from "@/stores/authStore";
import { ResizeMode, Video } from "expo-av";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChatCircle, X } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, Image, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function StoryViewerScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const [stories, setStories] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    if (userId) {
      loadStories();
    }
  }, [userId]);

  useEffect(() => {
    if (stories.length > 0 && currentUser?.id) {
      viewStory(stories[currentIndex].id, currentUser.id);
    }
  }, [currentIndex, stories]);

  const loadStories = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const userStories = await getUserStories(userId);
      setStories(userStories);
    } catch (error) {
      console.error("Error loading stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      router.back();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleReply = () => {
    setShowReplyModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !currentUser?.id || !currentStory) return;
    
    setReplying(true);
    try {
      await replyToStory(currentStory.id, currentUser.id, replyMessage.trim());
      setShowReplyModal(false);
      setReplyMessage("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Успешно", "Ответ отправлен");
    } catch (error) {
      console.error("Error replying to story:", error);
      Alert.alert("Ошибка", "Не удалось отправить ответ");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setReplying(false);
    }
  };

  if (loading || stories.length === 0) {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <Text className="text-text-secondary">Загрузка...</Text>
      </View>
    );
  }

  const currentStory = stories[currentIndex];

  return (
    <View className="flex-1 bg-black">
      <View className="absolute top-12 left-0 right-0 z-10 flex-row items-center justify-between px-4">
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View className="flex-row gap-1">
          {stories.map((_, index) => (
            <View
              key={index}
              className={`h-1 rounded-full ${index === currentIndex ? "bg-accent flex-1" : "bg-white/30 flex-1"}`}
            />
          ))}
        </View>
      </View>

      <View className="flex-1">
        {currentStory.mediaType === "image" ? (
          <Image
            source={{ uri: currentStory.mediaUri }}
            style={{ width, height }}
            resizeMode="contain"
          />
        ) : (
          <Video
            source={{ uri: currentStory.mediaUri }}
            style={{ width, height }}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping={false}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded && status.didJustFinish) {
                handleNext();
              }
            }}
          />
        )}
      </View>

      <View className="absolute bottom-12 left-0 right-0 px-4 z-10">
        <TouchableOpacity
          onPress={handleReply}
          className="bg-accent/20 border border-accent/50 rounded-full px-6 py-3 flex-row items-center justify-center"
          activeOpacity={0.8}
        >
          <ChatCircle size={20} color="#00b7ff" />
          <Text className="text-accent font-semibold ml-2">Ответить</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity className="absolute left-0 top-0 bottom-0 w-1/3" onPress={handlePrevious} activeOpacity={1} />
      <TouchableOpacity className="absolute right-0 top-0 bottom-0 w-2/3" onPress={handleNext} activeOpacity={1} />

      <Modal
        visible={showReplyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReplyModal(false)}
      >
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-secondary border-t border-accent/10 rounded-t-3xl p-4">
            <Text className="text-text-primary text-lg font-semibold mb-4">Ответить на историю</Text>
            <TextInput
              value={replyMessage}
              onChangeText={setReplyMessage}
              placeholder="Введите сообщение..."
              placeholderTextColor="#6B7280"
              className="bg-secondary/60 border border-accent/10 rounded-xl px-4 py-3 text-text-primary text-base mb-4"
              multiline
              autoFocus
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setShowReplyModal(false);
                  setReplyMessage("");
                }}
                className="flex-1 bg-secondary/60 border border-accent/10 rounded-xl py-3 items-center"
              >
                <Text className="text-text-secondary font-semibold">Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSendReply}
                disabled={!replyMessage.trim() || replying}
                className="flex-1 bg-accent rounded-xl py-3 items-center"
              >
                <Text className="text-white font-semibold">{replying ? "Отправка..." : "Отправить"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

