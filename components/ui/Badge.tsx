import React from "react";
import { View, Text } from "react-native";

interface BadgeProps {
  count: number;
  className?: string;
}

export function Badge({ count, className = "" }: BadgeProps) {
  if (count === 0) return null;

  return (
    <View
      className={`bg-danger rounded-full min-w-[20px] h-5 items-center justify-center px-1.5 ${className}`}
    >
      <Text className="text-white text-xs font-bold">{count > 99 ? "99+" : count}</Text>
    </View>
  );
}

