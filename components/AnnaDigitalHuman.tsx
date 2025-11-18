// Digital Human Anna Component
// Displays Anna as a Digital Human avatar using ZEGOCLOUD Digital Human AI

import { getZegoManager } from "@/lib/api/zegocloud";
import {
    createDigitalHumanVideoStream,
    driveDigitalHumanByAction,
    driveDigitalHumanByText,
    getDigitalHumanTaskStatus,
    interruptDigitalHumanTask,
    queryDigitalHumanAssets,
    stopDigitalHumanVideoStream,
} from "@/lib/api/zegocloud-digital-human";
import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";

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

interface AnnaDigitalHumanProps {
  roomId: string;
  userId: string;
  onReady?: (taskId: string, streamId: string) => void;
  onError?: (error: Error) => void;
  assetId?: string; // Optional: specific Digital Human asset ID
}

export function AnnaDigitalHuman({
  roomId,
  userId,
  onReady,
  onError,
  assetId,
}: AnnaDigitalHumanProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [streamId, setStreamId] = useState<string | null>(null);
  const remoteViewRef = useRef<any>(null);
  const zegoManagerRef = useRef(getZegoManager());

  useEffect(() => {
    initializeDigitalHuman();
    return () => {
      cleanup();
    };
  }, [roomId, userId]);

  const initializeDigitalHuman = async () => {
    if (Platform.OS === "web") {
      console.warn("Digital Human is not supported on web platform");
      return;
    }

    try {
      // 1. Query available Digital Human assets
      const assets = await queryDigitalHumanAssets();
      const selectedAsset = assetId
        ? assets.find((a) => a.assetId === assetId)
        : assets.find((a) => a.assetType === "image_based") || assets[0];

      if (!selectedAsset) {
        throw new Error("No Digital Human assets available");
      }

      // 2. Initialize ZEGO engine
      await zegoManagerRef.current.initialize();
      await zegoManagerRef.current.joinRoom(roomId, userId, "Anna");

      // 3. Create video stream task
      const streamIdValue = `anna_stream_${userId}_${Date.now()}`;
      const task = await createDigitalHumanVideoStream({
        roomId,
        streamId: streamIdValue,
        assetId: selectedAsset.assetId,
        backgroundColor: "#090D12", // Dark background matching app theme
        maxDuration: 3600, // 1 hour
        videoConfig: {
          resolution: "720p",
          bitrate: 1500,
          fps: 30,
        },
      });

      setTaskId(task.taskId);
      setStreamId(streamIdValue);

      // 4. Wait for stream to be ready and start playing
      const checkStatus = setInterval(async () => {
        try {
          const status = await getDigitalHumanTaskStatus(task.taskId);
          if (status.status === 3) {
            // Streaming
            clearInterval(checkStatus);
            if (remoteViewRef.current) {
              await zegoManagerRef.current.startPlayingStream(streamIdValue, remoteViewRef.current);
            }
            setIsInitialized(true);
            onReady?.(task.taskId, streamIdValue);
          } else if (status.status === 2) {
            // Failed
            clearInterval(checkStatus);
            throw new Error("Digital Human stream initialization failed");
          }
        } catch (error) {
          clearInterval(checkStatus);
          throw error;
        }
      }, 1000);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkStatus);
        if (!isInitialized) {
          throw new Error("Digital Human initialization timeout");
        }
      }, 30000);
    } catch (error) {
      console.error("Error initializing Digital Human:", error);
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
    }
  };

  const speak = async (text: string, interrupt: boolean = false) => {
    if (!taskId) {
      throw new Error("Digital Human not initialized");
    }

    try {
      await driveDigitalHumanByText({
        taskId,
        driveType: "text",
        content: text,
        interrupt,
      });
    } catch (error) {
      console.error("Error making Digital Human speak:", error);
      throw error;
    }
  };

  const performAction = async (actionName: string, interrupt: boolean = false) => {
    if (!taskId) {
      throw new Error("Digital Human not initialized");
    }

    try {
      await driveDigitalHumanByAction(taskId, actionName, interrupt);
    } catch (error) {
      console.error("Error performing action:", error);
      throw error;
    }
  };

  const interrupt = async () => {
    if (!taskId) return;
    try {
      await interruptDigitalHumanTask(taskId);
    } catch (error) {
      console.error("Error interrupting Digital Human:", error);
    }
  };

  const cleanup = async () => {
    if (taskId) {
      try {
        await stopDigitalHumanVideoStream(taskId);
      } catch (error) {
        console.error("Error stopping Digital Human stream:", error);
      }
    }

    if (streamId) {
      try {
        await zegoManagerRef.current.stopPlayingStream(streamId);
      } catch (error) {
        console.error("Error stopping stream playback:", error);
      }
    }

    try {
      await zegoManagerRef.current.leaveRoom(roomId);
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  // Expose methods via ref (if needed)
  useEffect(() => {
    // Store methods in ref for external access
    if (remoteViewRef.current) {
      (remoteViewRef.current as any).__annaDigitalHuman = {
        speak,
        performAction,
        interrupt,
        isInitialized,
      };
    }
  }, [taskId, isInitialized]);

  return (
    <View style={StyleSheet.absoluteFill} className="bg-secondary/40">
      {isInitialized && streamId ? (
        <View style={StyleSheet.absoluteFill} ref={remoteViewRef}>
          {ZegoView && Platform.OS !== "web" ? (
            <ZegoView
              style={StyleSheet.absoluteFill}
              zOrder={0}
              objectFit="contain"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              {/* Placeholder for web */}
            </View>
          )}
        </View>
      ) : (
        <View className="flex-1 items-center justify-center">
          {/* Loading state */}
        </View>
      )}
    </View>
  );
}

// Export hook for using Digital Human Anna
export function useAnnaDigitalHuman(roomId: string, userId: string) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const speakRef = useRef<((text: string) => Promise<void>) | null>(null);
  const performActionRef = useRef<((action: string) => Promise<void>) | null>(null);
  const interruptRef = useRef<(() => Promise<void>) | null>(null);

  const handleReady = () => {
    setIsReady(true);
  };

  const handleError = (err: Error) => {
    setError(err);
    setIsReady(false);
  };

  return {
    isReady,
    error,
    AnnaComponent: (
      <AnnaDigitalHuman
        roomId={roomId}
        userId={userId}
        onReady={handleReady}
        onError={handleError}
      />
    ),
    speak: async (text: string) => {
      if (speakRef.current) {
        await speakRef.current(text);
      }
    },
    performAction: async (action: string) => {
      if (performActionRef.current) {
        await performActionRef.current(action);
      }
    },
    interrupt: async () => {
      if (interruptRef.current) {
        await interruptRef.current();
      }
    },
  };
}

