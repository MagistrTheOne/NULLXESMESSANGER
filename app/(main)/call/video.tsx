import { CallKit } from "@/components/ZegoKits/CallKit";
import { useAuthStore } from "@/stores/authStore";
import { Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text } from "react-native";

export default function VideoCallRoute() {
  const router = useRouter();
  const { roomId, userId, userName, isVideo } = useLocalSearchParams<{
    roomId: string;
    userId: string;
    userName: string;
    isVideo: string;
  }>();
  const user = useAuthStore((state) => state.user);

  // ZEGO SDK only works on native platforms
  if (Platform.OS === "web") {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <Text className="text-text-primary text-lg">
          Видео звонки доступны только на мобильных устройствах
        </Text>
      </View>
    );
  }

  if (!roomId || !user?.id) {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <Text className="text-text-primary text-lg">Ошибка: не указаны параметры звонка</Text>
      </View>
    );
  }

  return (
    <CallKit
      callID={roomId}
      userID={user.id}
      userName={user.name || user.phone || "User"}
      avatarURL={user.avatar}
      isVideoCall={isVideo === "true"}
      onCallEnd={() => {
        router.back();
      }}
      onError={(error) => {
        console.error("Call Kit error:", error);
        // Fallback to custom implementation
        router.replace({
          pathname: "/(main)/call/video/fallback",
          params: { roomId, userId: user.id, userName: user.name || user.phone, isVideo },
        } as any);
      }}
    />
  );
}

