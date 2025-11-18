import { useVideoCall } from "@/hooks/useVideoCall";
import { useAuthStore } from "@/stores/authStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CameraRotate, Microphone, MicrophoneSlash, PhoneSlash, VideoCamera, VideoCameraSlash } from "phosphor-react-native";
import React, { useEffect } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ZEGO View component - динамический импорт для нативных платформ
let ZegoView: any = null;
if (Platform.OS !== "web") {
  try {
    const zegoModule = require("zego-express-engine-reactnative");
    ZegoView = zegoModule.ZegoView || zegoModule.default?.ZegoView;
  } catch (e) {
    console.warn("ZEGO View component not available");
  }
}

export default function VideoCallScreen() {
  const router = useRouter();
  const { roomId, userId, userName, isVideo } = useLocalSearchParams<{
    roomId: string;
    userId: string;
    userName: string;
    isVideo: string;
  }>();

  const user = useAuthStore((state) => state.user);
  const {
    callState,
    localViewRef,
    remoteViewRef,
    handleJoinCall,
    handleEndCall,
    toggleVideo,
    toggleAudio,
    switchCamera,
  } = useVideoCall(roomId || "", user?.id || "", user?.name || "");

  useEffect(() => {
    if (roomId && user?.id) {
      handleJoinCall(isVideo === "true");
    }
  }, [roomId, user?.id]);

  const handleEnd = async () => {
    await handleEndCall();
    router.back();
  };

  return (
    <View className="flex-1 bg-primary">
      {/* Remote video view */}
      <View className="flex-1">
        {callState.remoteStreamID ? (
          <View style={StyleSheet.absoluteFill} ref={remoteViewRef}>
            {ZegoView && Platform.OS !== "web" ? (
              <ZegoView
                style={StyleSheet.absoluteFill}
                zOrder={0}
                objectFit="cover"
              />
            ) : (
              <View className="flex-1 items-center justify-center bg-secondary/40">
                <Text className="text-text-primary">Удалённое видео</Text>
              </View>
            )}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center bg-secondary/40">
            <Text className="text-text-primary text-lg">Ожидание подключения...</Text>
          </View>
        )}
      </View>

      {/* Local video view (picture-in-picture) */}
      {callState.isVideoEnabled && callState.localStreamID && (
        <View className="absolute top-12 right-4 w-32 h-48 rounded-xl overflow-hidden border-2 border-accent bg-secondary/60">
          <View style={StyleSheet.absoluteFill} ref={localViewRef}>
            {ZegoView && Platform.OS !== "web" ? (
              <ZegoView
                style={StyleSheet.absoluteFill}
                zOrder={1}
                objectFit="cover"
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Text className="text-text-primary text-xs">Локальное видео</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Call controls */}
      <View className="absolute bottom-8 left-0 right-0 px-8">
        <View className="flex-row items-center justify-center gap-4">
          <TouchableOpacity
            onPress={toggleAudio}
            className={`w-16 h-16 rounded-full items-center justify-center ${
              callState.isAudioEnabled ? "bg-secondary/60" : "bg-danger"
            }`}
          >
            {callState.isAudioEnabled ? (
              <Microphone size={28} color="#FFFFFF" weight="fill" />
            ) : (
              <MicrophoneSlash size={28} color="#FFFFFF" weight="fill" />
            )}
          </TouchableOpacity>

          {isVideo === "true" && (
            <>
              <TouchableOpacity
                onPress={toggleVideo}
                className={`w-16 h-16 rounded-full items-center justify-center ${
                  callState.isVideoEnabled ? "bg-secondary/60" : "bg-danger"
                }`}
              >
                {callState.isVideoEnabled ? (
                  <VideoCamera size={28} color="#FFFFFF" weight="fill" />
                ) : (
                  <VideoCameraSlash size={28} color="#FFFFFF" weight="fill" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={switchCamera}
                className="w-16 h-16 rounded-full items-center justify-center bg-secondary/60"
              >
                <CameraRotate size={28} color="#FFFFFF" weight="fill" />
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            onPress={handleEnd}
            className="w-16 h-16 rounded-full items-center justify-center bg-danger"
          >
            <PhoneSlash size={28} color="#FFFFFF" weight="fill" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

