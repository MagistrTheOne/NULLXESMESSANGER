import { useVideoCall } from "@/hooks/useVideoCall";
import { useAuthStore } from "@/stores/authStore";
import { useRouter, useLocalSearchParams } from "expo-router";
import { PhoneSlash, VideoCamera, VideoCameraSlash, Microphone, MicrophoneSlash, CameraRotate } from "phosphor-react-native";
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// ZEGO View component - will be imported dynamically

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
            {/* ZEGO View will be rendered here */}
            <Text className="text-text-primary">Remote video stream</Text>
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
            {/* ZEGO View will be rendered here */}
            <Text className="text-text-primary text-xs">Local video</Text>
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

