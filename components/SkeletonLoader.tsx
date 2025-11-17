import React from "react";
import { View } from "react-native";
import { MotiView } from "moti";

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function SkeletonLoader({
  width = "100%",
  height = 20,
  borderRadius = 8,
  className = "",
}: SkeletonLoaderProps) {
  return (
    <MotiView
      from={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{
        type: "timing",
        duration: 1000,
        loop: true,
        repeatReverse: true,
      }}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: "#1F2937",
      }}
      className={className}
    />
  );
}

export function ChatListSkeleton() {
  return (
    <View className="px-4 py-3 bg-secondary/40 border-b border-accent/10">
      <View className="flex-row items-center">
        <SkeletonLoader width={56} height={56} borderRadius={28} />
        <View className="ml-3 flex-1">
          <SkeletonLoader width="60%" height={16} className="mb-2" />
          <SkeletonLoader width="80%" height={14} />
        </View>
      </View>
    </View>
  );
}

export function MessageSkeleton() {
  return (
    <View className="px-4 py-2">
      <View className="flex-row justify-end">
        <View className="max-w-[75%]">
          <SkeletonLoader width={200} height={60} borderRadius={16} />
        </View>
      </View>
    </View>
  );
}

