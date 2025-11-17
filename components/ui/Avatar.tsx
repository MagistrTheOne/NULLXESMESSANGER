import React from "react";
import { View, Text, Image } from "react-native";

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  className?: string;
  showBorder?: boolean;
}

export function Avatar({ uri, name, size = 48, className = "", showBorder = false }: AvatarProps) {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <View
      className={`rounded-full items-center justify-center overflow-hidden ${
        showBorder ? "border-2 border-accent" : ""
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} className="rounded-full" />
      ) : (
        <View
          className="bg-accent/20 items-center justify-center"
          style={{ width: size, height: size }}
        >
          <Text
            className="text-accent font-bold"
            style={{ fontSize: size * 0.4 }}
          >
            {initials}
          </Text>
        </View>
      )}
    </View>
  );
}

