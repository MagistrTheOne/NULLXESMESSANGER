// ZEGOCLOUD In-App Chat Kit (ZIM) Integration
// Documentation: https://www.zegocloud.com/docs/uikit/in-app-chat-kit-rn/overview
// Prebuilt UI components for chat (conversation list, message list, etc.)

import { getZegoCredentials } from "@/lib/zegocloud-config";
import { Platform } from "react-native";
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";

// Dynamic import for ZIM (In-App Chat)
let ZIMKit: any = null;
let ZIM: any = null;
if (Platform.OS !== "web") {
  try {
    const zimModule = require("zego-zim-react-native");
    ZIM = zimModule.ZIM;
    ZIMKit = zimModule.ZIMKit;
  } catch (e) {
    console.warn("ZIM (In-App Chat) not available:", e);
  }
}

interface InAppChatKitProps {
  userID: string;
  userName: string;
  avatarURL?: string;
  conversationID?: string;
  conversationType?: "Peer" | "Group" | "Room";
  onError?: (error: Error) => void;
}

/**
 * ZIM Conversation List Component
 */
export function ZIMConversationList({
  userID,
  userName,
  avatarURL,
  onError,
}: Omit<InAppChatKitProps, "conversationID" | "conversationType">) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [zim, setZim] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      const webError = new Error("ZIM is not supported on web platform");
      setError(webError);
      onError?.(webError);
      setLoading(false);
      return;
    }

    if (!ZIM || !ZIMKit) {
      const kitError = new Error("ZIM package not installed. Run: npm install zego-zim-react-native");
      setError(kitError);
      onError?.(kitError);
      setLoading(false);
      return;
    }

    const initZIM = async () => {
      try {
        const credentials = getZegoCredentials();
        
        // Create ZIM instance
        const zimInstance = ZIM.create(credentials.appID);
        setZim(zimInstance);

        // Login
        await zimInstance.login({ userID, userName, avatarURL: avatarURL || "" });
        
        setLoading(false);
      } catch (err) {
        const configError = err instanceof Error ? err : new Error(String(err));
        setError(configError);
        onError?.(configError);
        setLoading(false);
      }
    };

    initZIM();

    return () => {
      if (zim) {
        zim.logout();
        ZIM.destroy(zim);
      }
    };
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <ActivityIndicator size="large" color="#00B7FF" />
        <Text className="text-text-secondary mt-4">Инициализация чата...</Text>
      </View>
    );
  }

  if (error || !ZIMKit) {
    return (
      <View className="flex-1 bg-primary items-center justify-center px-6">
        <Text className="text-danger text-lg font-semibold mb-2">Ошибка</Text>
        <Text className="text-text-secondary text-center">
          {error?.message || "ZIM недоступен"}
        </Text>
      </View>
    );
  }

  return (
    <ZIMKit.ConversationList
      appID={getZegoCredentials().appID}
      userID={userID}
      userName={userName}
      avatarURL={avatarURL}
    />
  );
}

/**
 * ZIM Message List Component (for specific conversation)
 */
export function ZIMMessageList({
  userID,
  userName,
  avatarURL,
  conversationID,
  conversationType = "Peer",
  onError,
}: InAppChatKitProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [zim, setZim] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      const webError = new Error("ZIM is not supported on web platform");
      setError(webError);
      onError?.(webError);
      setLoading(false);
      return;
    }

    if (!ZIM || !ZIMKit || !conversationID) {
      if (!conversationID) {
        setLoading(false);
        return;
      }
      const kitError = new Error("ZIM package not installed. Run: npm install zego-zim-react-native");
      setError(kitError);
      onError?.(kitError);
      setLoading(false);
      return;
    }

    const initZIM = async () => {
      try {
        const credentials = getZegoCredentials();
        
        // Create ZIM instance
        const zimInstance = ZIM.create(credentials.appID);
        setZim(zimInstance);

        // Login
        await zimInstance.login({ userID, userName, avatarURL: avatarURL || "" });
        
        setLoading(false);
      } catch (err) {
        const configError = err instanceof Error ? err : new Error(String(err));
        setError(configError);
        onError?.(configError);
        setLoading(false);
      }
    };

    initZIM();

    return () => {
      if (zim) {
        zim.logout();
        ZIM.destroy(zim);
      }
    };
  }, [conversationID]);

  if (loading) {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <ActivityIndicator size="large" color="#00B7FF" />
        <Text className="text-text-secondary mt-4">Инициализация чата...</Text>
      </View>
    );
  }

  if (error || !ZIMKit || !conversationID) {
    return (
      <View className="flex-1 bg-primary items-center justify-center px-6">
        <Text className="text-danger text-lg font-semibold mb-2">Ошибка</Text>
        <Text className="text-text-secondary text-center">
          {error?.message || "ZIM недоступен или conversationID не указан"}
        </Text>
      </View>
    );
  }

  return (
    <ZIMKit.MessageList
      appID={getZegoCredentials().appID}
      userID={userID}
      userName={userName}
      avatarURL={avatarURL}
      conversationID={conversationID}
      conversationType={conversationType}
    />
  );
}

