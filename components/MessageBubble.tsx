import React from "react";
import { View, Text } from "react-native";
import { Check, CheckCheck } from "phosphor-react-native";

interface MessageBubbleProps {
  text: string;
  isOwn: boolean;
  time?: string;
  isRead?: boolean;
  reactions?: string[];
}

export function MessageBubble({ text, isOwn, time, isRead = false, reactions }: MessageBubbleProps) {
  return (
    <View className={`flex-row ${isOwn ? "justify-end" : "justify-start"} mb-2 px-4`}>
      <View
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isOwn
            ? "bg-accent"
            : "bg-secondary/60 border border-accent/10"
        }`}
        style={isOwn ? { borderBottomRightRadius: 4 } : { borderBottomLeftRadius: 4 }}
      >
        <Text className={`text-base ${isOwn ? "text-white" : "text-text-primary"}`}>
          {text}
        </Text>
        <View className="flex-row items-center justify-end mt-1">
          {time && (
            <Text className={`text-xs mr-1 ${isOwn ? "text-white/70" : "text-text-muted"}`}>
              {time}
            </Text>
          )}
          {isOwn && (
            isRead ? (
              <CheckCheck size={14} color="#FFFFFF" weight="fill" />
            ) : (
              <Check size={14} color="#FFFFFF" />
            )
          )}
        </View>
        {reactions && reactions.length > 0 && (
          <View className="flex-row flex-wrap mt-1">
            {reactions.map((emoji, idx) => (
              <Text key={idx} className="text-sm mr-1">
                {emoji}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

