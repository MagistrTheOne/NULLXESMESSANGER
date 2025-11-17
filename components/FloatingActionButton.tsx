import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Plus, Pencil, Camera } from "phosphor-react-native";
import { MotiView } from "moti";

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: "plus" | "pencil" | "camera";
  className?: string;
}

export function FloatingActionButton({
  onPress,
  icon = "plus",
  className = "",
}: FloatingActionButtonProps) {
  const IconComponent = icon === "pencil" ? Pencil : icon === "camera" ? Camera : Plus;

  return (
    <MotiView
      from={{ scale: 0.9, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 15 }}
    >
      <TouchableOpacity
        onPress={onPress}
        className={`w-14 h-14 bg-accent rounded-full items-center justify-center shadow-lg ${className}`}
        activeOpacity={0.8}
        style={{
          shadowColor: "#00B7FF",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <IconComponent size={24} color="#FFFFFF" weight="bold" />
      </TouchableOpacity>
    </MotiView>
  );
}

