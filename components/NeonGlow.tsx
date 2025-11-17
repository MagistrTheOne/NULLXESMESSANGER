import { MotiView } from "moti";
import React from "react";
import { View, ViewStyle } from "react-native";

interface NeonGlowProps {
  children: React.ReactNode;
  color?: "blue" | "spider" | "purple";
  intensity?: "low" | "medium" | "high";
  animated?: boolean;
  style?: ViewStyle;
}

export function NeonGlow({
  children,
  color = "blue",
  intensity = "medium",
  animated = false,
  style,
}: NeonGlowProps) {
  const colorMap = {
    blue: "#00B7FF",
    spider: "#0099dd",
    purple: "#8B5CF6",
  };

  const intensityMap = {
    low: { shadowOpacity: 0.3, shadowRadius: 8 },
    medium: { shadowOpacity: 0.5, shadowRadius: 12 },
    high: { shadowOpacity: 0.7, shadowRadius: 16 },
  };

  const selectedColor = colorMap[color];
  const selectedIntensity = intensityMap[intensity];

  const glowStyle: ViewStyle = {
    shadowColor: selectedColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: selectedIntensity.shadowOpacity,
    shadowRadius: selectedIntensity.shadowRadius,
    elevation: 8,
  };

  if (animated) {
    return (
      <MotiView
        from={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          type: "timing",
          duration: 2000,
          loop: true,
        }}
        style={[glowStyle, style]}
      >
        {children}
      </MotiView>
    );
  }

  return <View style={[glowStyle, style]}>{children}</View>;
}

