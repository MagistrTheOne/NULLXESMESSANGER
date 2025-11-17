import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import { Pause, Play, Waveform } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface VoiceMessageProps {
  uri: string;
  duration?: number;
  isOwn: boolean;
}

export function VoiceMessage({ uri, duration, isOwn }: VoiceMessageProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [playbackStatus, setPlaybackStatus] = useState<any>(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadSound = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false }
      );
      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status) => {
        setPlaybackStatus(status);
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPosition(0);
          }
        }
      });
    } catch (error) {
      console.error("Error loading sound:", error);
    }
  };

  const handlePlayPause = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!sound) {
      await loadSound();
      return;
    }

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error("Error playing/pausing sound:", error);
    }
  };

  const formatDuration = (millis: number) => {
    const seconds = Math.floor(millis / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const progress = playbackStatus?.isLoaded && playbackStatus?.durationMillis
    ? position / playbackStatus.durationMillis
    : 0;

  return (
    <View className={`flex-row items-center ${isOwn ? "justify-end" : "justify-start"}`}>
      <TouchableOpacity
        onPress={handlePlayPause}
        className={`flex-row items-center px-4 py-3 rounded-2xl ${
          isOwn ? "bg-accent" : "bg-secondary/60 border border-accent/10"
        }`}
        activeOpacity={0.8}
      >
        {isPlaying ? (
          <MotiView
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ type: "timing", duration: 500, loop: true }}
          >
            <Pause size={24} color={isOwn ? "#FFFFFF" : "#00B7FF"} weight="fill" />
          </MotiView>
        ) : (
          <Play size={24} color={isOwn ? "#FFFFFF" : "#00B7FF"} weight="fill" />
        )}
        
        <View className="ml-3 flex-1" style={{ width: 150 }}>
          <View className="h-1 bg-white/20 rounded-full overflow-hidden mb-1">
            <View
              className="h-full bg-accent rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </View>
          <Text className={`text-xs ${isOwn ? "text-white/70" : "text-text-muted"}`}>
            {formatDuration(position || duration || 0)}
          </Text>
        </View>

        <View className="ml-2">
          <Waveform size={20} color={isOwn ? "#FFFFFF" : "#00B7FF"} weight="fill" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

