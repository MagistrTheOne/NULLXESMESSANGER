import React from "react";
import { View } from "react-native";
import { MotiView } from "moti";
import { Sparkle } from "phosphor-react-native";

interface AnnaAvatarProps {
  isGenerating?: boolean;
  size?: number;
}

export function AnnaAvatar({ isGenerating = false, size = 64 }: AnnaAvatarProps) {
  return (
    <View className="relative items-center justify-center" style={{ width: size + 16, height: size + 16 }}>
      <MotiView
        from={{ scale: 1, opacity: 1 }}
        animate={{
          scale: isGenerating ? [1, 1.1, 1] : 1,
          opacity: isGenerating ? [1, 0.7, 1] : 1,
        }}
        transition={{
          type: "timing",
          duration: 2000,
          loop: isGenerating,
        }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#00B7FF",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 2,
          borderColor: "rgba(0, 183, 255, 0.5)",
        }}
      >
        <View
          style={{
            width: size * 0.75,
            height: size * 0.75,
            borderRadius: (size * 0.75) / 2,
            backgroundColor: "rgba(15, 21, 28, 0.8)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sparkle size={size * 0.4} color="#00B7FF" weight="fill" />
        </View>
      </MotiView>
      {isGenerating && (
        <MotiView
          from={{ rotate: "0deg", scale: 1 }}
          animate={{ rotate: "360deg", scale: [1, 1.2, 1] }}
          transition={{
            type: "timing",
            duration: 3000,
            loop: true,
          }}
          style={{
            position: "absolute",
            width: size + 8,
            height: size + 8,
            borderRadius: (size + 8) / 2,
            borderWidth: 2,
            borderColor: "rgba(0, 183, 255, 0.3)",
            borderStyle: "dashed",
          }}
        />
      )}
    </View>
  );
}

