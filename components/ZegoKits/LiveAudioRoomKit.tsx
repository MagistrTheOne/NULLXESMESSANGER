// ZEGOCLOUD Live Audio Room Kit Integration
// Documentation: https://www.zegocloud.com/docs/uikit/live-audio-room-kit-rn/overview
// Prebuilt UI for live audio rooms with speaker seats

import { getZegoCredentials } from "@/lib/zegocloud-config";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";

// Dynamic import for Live Audio Room Kit
let ZegoUIKitPrebuiltLiveAudioRoom: any = null;
if (Platform.OS !== "web") {
  try {
    ZegoUIKitPrebuiltLiveAudioRoom = require("@zegocloud/zego-uikit-prebuilt-live-audio-room-rn").default;
  } catch (e) {
    console.warn("Live Audio Room Kit not available:", e);
  }
}

interface LiveAudioRoomKitProps {
  roomID: string;
  userID: string;
  userName: string;
  avatarURL?: string;
  isHost?: boolean;
  onLeave?: () => void;
  onError?: (error: Error) => void;
}

export function LiveAudioRoomKit({
  roomID,
  userID,
  userName,
  avatarURL,
  isHost = false,
  onLeave,
  onError,
}: LiveAudioRoomKitProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      const webError = new Error("Live Audio Room Kit is not supported on web platform");
      setError(webError);
      onError?.(webError);
      setLoading(false);
      return;
    }

    if (!ZegoUIKitPrebuiltLiveAudioRoom) {
      const kitError = new Error("Live Audio Room Kit package not installed. Run: npm install @zegocloud/zego-uikit-prebuilt-live-audio-room-rn");
      setError(kitError);
      onError?.(kitError);
      setLoading(false);
      return;
    }

    try {
      getZegoCredentials();
      setLoading(false);
    } catch (err) {
      const configError = err instanceof Error ? err : new Error(String(err));
      setError(configError);
      onError?.(configError);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <ActivityIndicator size="large" color="#00B7FF" />
        <Text className="text-text-secondary mt-4">Инициализация аудио комнаты...</Text>
      </View>
    );
  }

  if (error || !ZegoUIKitPrebuiltLiveAudioRoom) {
    return (
      <View className="flex-1 bg-primary items-center justify-center px-6">
        <Text className="text-danger text-lg font-semibold mb-2">Ошибка</Text>
        <Text className="text-text-secondary text-center">
          {error?.message || "Live Audio Room Kit недоступен"}
        </Text>
      </View>
    );
  }

  const credentials = getZegoCredentials();

  return (
    <ZegoUIKitPrebuiltLiveAudioRoom
      appID={credentials.appID}
      appSign={credentials.appSign}
      userID={userID}
      userName={userName}
      roomID={roomID}
      config={{
        role: isHost ? "Host" : "Audience",
        onLeave: () => {
          onLeave?.();
        },
        onError: (errorCode: number, errorMessage: string) => {
          const err = new Error(`Live Audio Room Error ${errorCode}: ${errorMessage}`);
          setError(err);
          onError?.(err);
        },
        // Customize UI
        seatConfig: {
          takeSeatWhenJoining: isHost,
          removeSpeakerWhenLeaving: true,
        },
        // Avatar
        avatarBuilder: avatarURL ? { builder: () => avatarURL } : undefined,
        // Seat layout
        layoutConfig: {
          mode: "auto", // or "grid", "circle"
        },
      }}
    />
  );
}

