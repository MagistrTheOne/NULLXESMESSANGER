// Anna AI Agent Component
// Real-time voice/video call with AI Agent using ZEGOCLOUD
// Documentation: https://www.zegocloud.com/docs/aiagent-server/introduction/overview

import { getZegoManager } from "@/lib/api/zegocloud";
import {
    createDigitalHumanAgentInstance,
    createVoiceAgentInstance,
    deleteAnnaAgentInstance,
    getAgentInstanceStatus,
    interruptAnnaAgent,
} from "@/lib/api/zegocloud-ai-agent";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

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

export type AgentStatus = "idle" | "listening" | "thinking" | "speaking";
export type CallType = "voice" | "digital_human_video";

interface AnnaAIAgentProps {
  roomId: string;
  userId: string;
  agentId: string;
  callType?: CallType;
  onReady?: (instanceId: string) => void;
  onError?: (error: Error) => void;
  onStatusChange?: (status: AgentStatus) => void;
  onTranscription?: (text: string, isUser: boolean) => void; // Real-time transcription
}

export function AnnaAIAgent({
  roomId,
  userId,
  agentId,
  callType = "digital_human_video",
  onReady,
  onError,
  onStatusChange,
  onTranscription,
}: AnnaAIAgentProps) {
  const [isReady, setIsReady] = useState(false);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("idle");
  const [error, setError] = useState<Error | null>(null);
  const remoteViewRef = useRef<any>(null);
  const zegoManagerRef = useRef(getZegoManager());
  const statusCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const readyCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    initializeAgent();
    return () => {
      cleanup();
    };
  }, [roomId, userId, agentId, callType]);

  const initializeAgent = async () => {
    if (Platform.OS === "web") {
      const webError = new Error("AI Agent is not supported on web platform");
      setError(webError);
      onError?.(webError);
      return;
    }

    try {
      // 1. Initialize ZEGO engine
      await zegoManagerRef.current.initialize();
      await zegoManagerRef.current.joinRoom(roomId, userId, "User");

      // 2. Create AI Agent instance based on call type
      let instance;
      if (callType === "digital_human_video") {
        instance = await createDigitalHumanAgentInstance(agentId, roomId, userId);
      } else {
        instance = await createVoiceAgentInstance(agentId, roomId, userId);
      }

      setInstanceId(instance.instanceId);

      // 3. Wait for agent to be ready and stream available
      readyCheckInterval.current = setInterval(async () => {
        try {
          const status = await getAgentInstanceStatus(instance.instanceId);
          
          // Check if instance is ready
          if (status.status === "ready" || status.status === "active") {
            clearInterval(readyCheckInterval.current!);
            
            // For video calls, wait for stream and start playing
            if (callType === "digital_human_video") {
              // Wait a bit for stream to be available
              setTimeout(async () => {
                try {
                  // The agent's video stream should be available in the room
                  // We need to start playing it
                  const streamId = `anna_stream_${agentId}_${roomId}`;
                  if (remoteViewRef.current) {
                    await zegoManagerRef.current.startPlayingStream(streamId, remoteViewRef.current);
                  }
                } catch (streamError) {
                  console.warn("Stream not immediately available, will retry:", streamError);
                }
              }, 2000);
            }

            setIsReady(true);
            onReady?.(instance.instanceId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Start status polling
            startStatusPolling(instance.instanceId);
          } else if (status.status === "failed" || status.status === "error") {
            clearInterval(readyCheckInterval.current!);
            throw new Error("AI Agent instance initialization failed");
          }
        } catch (error) {
          clearInterval(readyCheckInterval.current!);
          throw error;
        }
      }, 1000);

      // Timeout after 30 seconds
      setTimeout(() => {
        if (readyCheckInterval.current) {
          clearInterval(readyCheckInterval.current);
        }
        if (!isReady) {
          const timeoutError = new Error("AI Agent initialization timeout");
          setError(timeoutError);
          onError?.(timeoutError);
        }
      }, 30000);
    } catch (error) {
      console.error("Error initializing AI Agent:", error);
      const err = error instanceof Error ? error : new Error(String(error));
      setError(err);
      onError?.(err);
    }
  };

  const startStatusPolling = (instanceId: string) => {
    statusCheckInterval.current = setInterval(async () => {
      try {
        const status = await getAgentInstanceStatus(instanceId);
        const newStatus = status.agentStatus as AgentStatus;
        
        if (newStatus && newStatus !== agentStatus) {
          setAgentStatus(newStatus);
          onStatusChange?.(newStatus);
          
          // Haptic feedback for status changes
          if (newStatus === "speaking") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      } catch (error) {
        console.error("Error checking status:", error);
      }
    }, 500); // Check every 500ms for real-time updates
  };

  const interrupt = async () => {
    if (!instanceId) return;
    try {
      await interruptAnnaAgent(instanceId);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error("Error interrupting agent:", error);
    }
  };

  const cleanup = async () => {
    if (readyCheckInterval.current) {
      clearInterval(readyCheckInterval.current);
    }
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
    }

    if (instanceId) {
      try {
        await deleteAnnaAgentInstance(instanceId);
      } catch (error) {
        console.error("Error deleting instance:", error);
      }
    }

    try {
      await zegoManagerRef.current.leaveRoom(roomId);
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  // Expose interrupt method
  useEffect(() => {
    if (remoteViewRef.current) {
      (remoteViewRef.current as any).__annaAIAgent = {
        interrupt,
        isReady,
        agentStatus,
      };
    }
  }, [instanceId, isReady, agentStatus]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-secondary/40">
        <Text className="text-danger text-base">Ошибка: {error.message}</Text>
        <Text className="text-text-secondary text-sm mt-2">
          Переключитесь в текстовый режим
        </Text>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill} className="bg-secondary/40">
      {isReady && callType === "digital_human_video" ? (
        <View style={StyleSheet.absoluteFill} ref={remoteViewRef}>
          {ZegoView && Platform.OS !== "web" ? (
            <ZegoView
              style={StyleSheet.absoluteFill}
              zOrder={0}
              objectFit="contain"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-text-primary text-lg">Anna Digital Human</Text>
            </View>
          )}
        </View>
      ) : (
        <View className="flex-1 items-center justify-center">
          <View className="items-center">
            <Text className="text-text-primary text-lg mb-2">
              {isReady ? "Голосовой режим активен" : "Инициализация Anna..."}
            </Text>
            {agentStatus !== "idle" && (
              <View className="mt-4 items-center">
                <View className={`w-3 h-3 rounded-full mb-2 ${
                  agentStatus === "speaking" ? "bg-accent" :
                  agentStatus === "listening" ? "bg-green-500" :
                  agentStatus === "thinking" ? "bg-yellow-500" :
                  "bg-gray-500"
                }`} />
                <Text className="text-text-secondary text-sm">
                  {agentStatus === "speaking" ? "Anna говорит" :
                   agentStatus === "listening" ? "Слушает..." :
                   agentStatus === "thinking" ? "Думает..." :
                   "Готов"}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

