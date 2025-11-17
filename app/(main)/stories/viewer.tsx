import { getUserStories, viewStory } from "@/lib/api/db";
import { useAuthStore } from "@/stores/authStore";
import { ResizeMode, Video } from "expo-av";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function StoryViewerScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const [stories, setStories] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

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

      <TouchableOpacity className="absolute left-0 top-0 bottom-0 w-1/3" onPress={handlePrevious} activeOpacity={1} />
      <TouchableOpacity className="absolute right-0 top-0 bottom-0 w-2/3" onPress={handleNext} activeOpacity={1} />
    </View>
  );
}

