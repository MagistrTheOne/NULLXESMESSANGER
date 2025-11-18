import { getZegoManager } from "@/lib/api/zegocloud";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

export interface CallState {
  isConnected: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isFrontCamera: boolean;
  remoteStreamID: string | null;
  localStreamID: string | null;
}

export function useVideoCall(roomID: string, userID: string, userName: string) {
  const [callState, setCallState] = useState<CallState>({
    isConnected: false,
    isVideoEnabled: true,
    isAudioEnabled: true,
    isFrontCamera: true,
    remoteStreamID: null,
    localStreamID: null,
  });

  const zegoManagerRef = useRef(getZegoManager());
  const localViewRef = useRef<any>(null);
  const remoteViewRef = useRef<any>(null);

  const handleEndCall = async () => {
    try {
      // Используем функциональное обновление для получения актуального состояния
      setCallState((prev) => {
        if (prev.localStreamID) {
          zegoManagerRef.current.stopPublishingStream(prev.localStreamID).catch(console.error);
        }
        if (prev.remoteStreamID) {
          zegoManagerRef.current.stopPlayingStream(prev.remoteStreamID).catch(console.error);
        }
        zegoManagerRef.current.leaveRoom(roomID).catch(console.error);
        return {
          isConnected: false,
          isVideoEnabled: false,
          isAudioEnabled: false,
          isFrontCamera: true,
          remoteStreamID: null,
          localStreamID: null,
        };
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error ending call:", error);
    }
  };

  useEffect(() => {
    // Устанавливаем callback для обновления remote stream
    zegoManagerRef.current.setOnRemoteStreamUpdate((streamID: string | null) => {
      setCallState((prev) => ({ ...prev, remoteStreamID: streamID }));
      if (streamID && remoteViewRef.current) {
        zegoManagerRef.current.startPlayingStream(streamID, remoteViewRef.current);
      }
    });

    return () => {
      // Cleanup при размонтировании
      handleEndCall();
    };
  }, []);

  const handleJoinCall = async (video: boolean = true) => {
    if (Platform.OS === "web") {
      console.warn("Video calls are not supported on web platform");
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      await zegoManagerRef.current.initialize();
      await zegoManagerRef.current.joinRoom(roomID, userID, userName);

      const streamID = `stream_${userID}_${Date.now()}`;
      
      // Начинаем публикацию локального потока
      if (localViewRef.current) {
        await zegoManagerRef.current.startPublishingStream(streamID, video, localViewRef.current);
      } else {
        await zegoManagerRef.current.startPublishingStream(streamID, video);
      }

      setCallState((prev) => ({
        ...prev,
        isConnected: true,
        isVideoEnabled: video,
        localStreamID: streamID,
      }));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error joining call:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw error;
    }
  };


  const toggleVideo = async () => {
    try {
      const newState = !callState.isVideoEnabled;
      await zegoManagerRef.current.enableCamera(newState);
      setCallState((prev) => ({ ...prev, isVideoEnabled: newState }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Error toggling video:", error);
    }
  };

  const toggleAudio = async () => {
    try {
      const newState = !callState.isAudioEnabled;
      await zegoManagerRef.current.enableMicrophone(newState);
      setCallState((prev) => ({ ...prev, isAudioEnabled: newState }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Error toggling audio:", error);
    }
  };

  const switchCamera = async () => {
    try {
      await zegoManagerRef.current.switchCamera();
      setCallState((prev) => ({ ...prev, isFrontCamera: !prev.isFrontCamera }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Error switching camera:", error);
    }
  };

  return {
    callState,
    localViewRef,
    remoteViewRef,
    handleJoinCall,
    handleEndCall,
    toggleVideo,
    toggleAudio,
    switchCamera,
  };
}

