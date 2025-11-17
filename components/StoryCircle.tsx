import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Avatar } from "./ui/Avatar";
import { Plus } from "phosphor-react-native";

interface StoryCircleProps {
  uri?: string;
  name: string;
  isOwn?: boolean;
  hasNew?: boolean;
  onPress: () => void;
}

export function StoryCircle({ uri, name, isOwn = false, hasNew = false, onPress }: StoryCircleProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="items-center mr-4"
      activeOpacity={0.7}
    >
      <View className="relative">
        <Avatar
          uri={uri}
          name={name}
          size={64}
          showBorder={hasNew}
          className={hasNew ? "border-2 border-accent" : ""}
        />
        {isOwn && (
          <View className="absolute bottom-0 right-0 bg-accent rounded-full p-1.5 border-2 border-primary">
            <Plus size={16} color="#FFFFFF" weight="bold" />
          </View>
        )}
      </View>
      <Text className="text-text-secondary text-xs mt-2 max-w-[64px]" numberOfLines={1}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

