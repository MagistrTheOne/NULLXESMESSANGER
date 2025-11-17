import { Platform } from "react-native";
import { View, Text } from "react-native";
import VideoCallScreen from "@/components/VideoCall/VideoCallScreen";

export default function VideoCallRoute() {
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

  return <VideoCallScreen />;
}

