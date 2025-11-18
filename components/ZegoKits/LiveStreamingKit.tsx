// ZEGOCLOUD Live Streaming Kit Integration
// Documentation: https://www.zegocloud.com/docs/uikit/live-streaming-kit-rn/overview
// Prebuilt UI for live streaming with interactive features

import { getZegoCredentials } from "@/lib/zegocloud-config";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";

// Dynamic import for Live Streaming Kit
let ZegoUIKitPrebuiltLiveStreaming: any = null;
if (Platform.OS !== "web") {
  try {
    ZegoUIKitPrebuiltLiveStreaming = require("@zegocloud/zego-uikit-prebuilt-live-streaming-rn").default;
  } catch (e) {
    console.warn("Live Streaming Kit not available:", e);
  }
}

interface LiveStreamingKitProps {
  liveID: string;
  userID: string;
  userName: string;
  avatarURL?: string;
  isHost?: boolean;
  onLeave?: () => void;
  onError?: (error: Error) => void;
}

export function LiveStreamingKit({
  liveID,
  userID,
  userName,
  avatarURL,
  isHost = false,
  onLeave,
  onError,
}: LiveStreamingKitProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      const webError = new Error("Live Streaming Kit is not supported on web platform");
      setError(webError);
      onError?.(webError);
      setLoading(false);
      return;
    }

    if (!ZegoUIKitPrebuiltLiveStreaming) {
      const kitError = new Error("Live Streaming Kit package not installed. Run: npm install @zegocloud/zego-uikit-prebuilt-live-streaming-rn");
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
        <Text className="text-text-secondary mt-4">Инициализация стрима...</Text>
      </View>
    );
  }

  if (error || !ZegoUIKitPrebuiltLiveStreaming) {
    return (
      <View className="flex-1 bg-primary items-center justify-center px-6">
        <Text className="text-danger text-lg font-semibold mb-2">Ошибка</Text>
        <Text className="text-text-secondary text-center">
          {error?.message || "Live Streaming Kit недоступен"}
        </Text>
      </View>
    );
  }

  const credentials = getZegoCredentials();

  return (
    <ZegoUIKitPrebuiltLiveStreaming
      appID={credentials.appID}
      appSign={credentials.appSign}
      userID={userID}
      userName={userName}
      liveID={liveID}
      config={{
        role: isHost ? "Host" : "Audience",
        turnOnCameraWhenJoining: isHost,
        turnOnMicrophoneWhenJoining: isHost,
        onLeave: () => {
          onLeave?.();
        },
        onError: (errorCode: number, errorMessage: string) => {
          const err = new Error(`Live Streaming Error ${errorCode}: ${errorMessage}`);
          setError(err);
          onError?.(err);
        },
        // Customize UI
        layout: {
          mode: "picture-in-picture-mode",
        },
        // Avatar
        avatarBuilder: avatarURL ? { builder: () => avatarURL } : undefined,
        // Gift system
        giftConfig: {
          enabled: true,
        },
        // Co-hosting
        coHostingConfig: {
          enabled: true,
        },
      }}
    />
  );
}

