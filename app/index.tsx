import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    const inMainGroup = segments[0] === "(main)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/phone");
    } else if (isAuthenticated && !inMainGroup) {
      router.replace("/(main)/chats");
    }
  }, [isAuthenticated, segments]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#090D12" }}>
      <ActivityIndicator size="large" color="#00B7FF" />
    </View>
  );
}

