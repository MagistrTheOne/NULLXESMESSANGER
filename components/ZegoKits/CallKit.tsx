// ZEGOCLOUD Call Kit Integration
// Documentation: https://www.zegocloud.com/docs/uikit/callkit-rn/overview
// Prebuilt UI for 1-on-1 and group voice/video calls

import { getZegoCredentials } from "@/lib/zegocloud-config";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";

// Dynamic import for Call Kit
let ZegoUIKitPrebuiltCall: any = null;
if (Platform.OS !== "web") {
  try {
    ZegoUIKitPrebuiltCall = require("@zegocloud/zego-uikit-prebuilt-call-rn").default;
  } catch (e) {
    console.warn("Call Kit not available:", e);
  }
}

interface CallKitProps {
  callID: string;
  userID: string;
  userName: string;
  avatarURL?: string;
  isVideoCall?: boolean;
  onCallEnd?: () => void;
  onError?: (error: Error) => void;
}

export function CallKit({
  callID,
  userID,
  userName,
  avatarURL,
  isVideoCall = true,
  onCallEnd,
  onError,
}: CallKitProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      const webError = new Error("Call Kit is not supported on web platform");
      setError(webError);
      onError?.(webError);
      setLoading(false);
      return;
    }

    if (!ZegoUIKitPrebuiltCall) {
      const kitError = new Error("Call Kit package not installed. Run: npm install @zegocloud/zego-uikit-prebuilt-call-rn");
      setError(kitError);
      onError?.(kitError);
      setLoading(false);
      return;
    }

    try {
      const credentials = getZegoCredentials();
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
        <Text className="text-text-secondary mt-4">Инициализация звонка...</Text>
      </View>
    );
  }

  if (error || !ZegoUIKitPrebuiltCall) {
    return (
      <View className="flex-1 bg-primary items-center justify-center px-6">
        <Text className="text-danger text-lg font-semibold mb-2">Ошибка</Text>
        <Text className="text-text-secondary text-center">
          {error?.message || "Call Kit недоступен"}
        </Text>
      </View>
    );
  }

  const credentials = getZegoCredentials();

  return (
    <ZegoUIKitPrebuiltCall
      appID={credentials.appID}
      appSign={credentials.appSign}
      userID={userID}
      userName={userName}
      callID={callID}
      config={{
        turnOnCameraWhenJoining: isVideoCall,
        turnOnMicrophoneWhenJoining: true,
        onHangUp: () => {
          onCallEnd?.();
        },
        onError: (errorCode: number, errorMessage: string) => {
          const err = new Error(`Call Kit Error ${errorCode}: ${errorMessage}`);
          setError(err);
          onError?.(err);
        },
        // Customize UI
        layout: {
          mode: "picture-in-picture-mode", // or "gallery-mode" for group calls
        },
        // Avatar
        avatarBuilder: avatarURL ? { builder: () => avatarURL } : undefined,
        // Sound effects
        ringtoneConfig: {
          incomingCallFileName: "incoming_call.mp3",
          outgoingCallFileName: "outgoing_call.mp3",
        },
      }}
    />
  );
}

