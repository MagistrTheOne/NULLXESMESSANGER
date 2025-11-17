import { formatDateHeader } from "@/lib/utils/format";
import React from "react";
import { Text, View } from "react-native";

interface DateHeaderProps {
  date: Date | string;
}

export function DateHeader({ date }: DateHeaderProps) {
  return (
    <View className="items-center my-4">
      <View className="bg-secondary/60 px-4 py-2 rounded-full border border-accent/20">
        <Text className="text-text-secondary text-xs font-semibold">
          {formatDateHeader(date)}
        </Text>
      </View>
    </View>
  );
}

