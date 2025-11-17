import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    // Wait for store to hydrate from AsyncStorage
    if (!hasHydrated) {
      return;
    }

    // Check if user has seen welcome screen (stored in AsyncStorage)
    const checkWelcome = async () => {
      try {
        const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
        const seen = await AsyncStorage.getItem("hasSeenWelcome");
        setHasSeenWelcome(seen === "true");
      } catch (error) {
        console.error("Error checking welcome:", error);
        setHasSeenWelcome(false);
      }
    };

    checkWelcome();
  }, [hasHydrated]);

  useEffect(() => {
    if (!hasHydrated || hasSeenWelcome === null) {
      return;
    }

    // Navigate based on auth state and welcome screen
    if (isAuthenticated) {
      router.replace("/(main)/chats" as any);
    } else if (!hasSeenWelcome) {
      // First time - show welcome screen
      router.replace("/welcome" as any);
    } else {
      // Already seen welcome - go to auth
      router.replace("/(auth)/phone" as any);
    }
  }, [hasHydrated, isAuthenticated, hasSeenWelcome]);

  // Show loading while hydrating
  if (!hasHydrated || hasSeenWelcome === null) {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <ActivityIndicator size="large" color="#00B7FF" />
        <Text className="text-text-secondary mt-4 text-sm">Загрузка...</Text>
      </View>
    );
  }

  // Fallback loading state
  return (
    <View className="flex-1 bg-primary items-center justify-center">
      <ActivityIndicator size="large" color="#00B7FF" />
    </View>
  );
}
