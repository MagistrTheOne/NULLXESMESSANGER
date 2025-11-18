// ZEGOCLOUD Video Conference Kit Integration
// Documentation: https://www.zegocloud.com/docs/uikit/video-conference-kit-rn/overview
// Prebuilt UI for multi-user video conferences

import { getZegoCredentials } from "@/lib/zegocloud-config";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";

// Dynamic import for Video Conference Kit
let ZegoUIKitPrebuiltVideoConference: any = null;
if (Platform.OS !== "web") {
  try {
    ZegoUIKitPrebuiltVideoConference = require("@zegocloud/zego-uikit-prebuilt-video-conference-rn").default;
  } catch (e) {
    console.warn("Video Conference Kit not available:", e);
  }
}

interface VideoConferenceKitProps {
  conferenceID: string;
  userID: string;
  userName: string;
  avatarURL?: string;
  onLeave?: () => void;
  onError?: (error: Error) => void;
}

export function VideoConferenceKit({
  conferenceID,
  userID,
  userName,
  avatarURL,
  onLeave,
  onError,
}: VideoConferenceKitProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      const webError = new Error("Video Conference Kit is not supported on web platform");
      setError(webError);
      onError?.(webError);
      setLoading(false);
      return;
    }

    if (!ZegoUIKitPrebuiltVideoConference) {
      const kitError = new Error("Video Conference Kit package not installed. Run: npm install @zegocloud/zego-uikit-prebuilt-video-conference-rn");
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
        <Text className="text-text-secondary mt-4">Инициализация конференции...</Text>
      </View>
    );
  }

  if (error || !ZegoUIKitPrebuiltVideoConference) {
    return (
      <View className="flex-1 bg-primary items-center justify-center px-6">
        <Text className="text-danger text-lg font-semibold mb-2">Ошибка</Text>
        <Text className="text-text-secondary text-center">
          {error?.message || "Video Conference Kit недоступен"}
        </Text>
      </View>
    );
  }

  const credentials = getZegoCredentials();

  return (
    <ZegoUIKitPrebuiltVideoConference
      appID={credentials.appID}
      appSign={credentials.appSign}
      userID={userID}
      userName={userName}
      conferenceID={conferenceID}
      config={{
        turnOnCameraWhenJoining: false, // User can enable manually
        turnOnMicrophoneWhenJoining: false, // User can enable manually
        onLeave: () => {
          onLeave?.();
        },
        onError: (errorCode: number, errorMessage: string) => {
          const err = new Error(`Video Conference Error ${errorCode}: ${errorMessage}`);
          setError(err);
          onError?.(err);
        },
        // Customize UI
        layout: {
          mode: "auto", // or "gallery", "speaker"
        },
        // Avatar
        avatarBuilder: avatarURL ? { builder: () => avatarURL } : undefined,
        // Member list
        memberListConfig: {
          showMicrophoneState: true,
          showCameraState: true,
        },
      }}
    />
  );
}

