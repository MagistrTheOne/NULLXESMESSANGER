import * as Haptics from "expo-haptics";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const EMOJI_CATEGORIES = {
  "Часто используемые": ["👍", "❤️", "😂", "😮", "😢", "🙏", "👏", "🔥"],
  "Смайлики": ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔"],
  "Жесты": ["👋", "🤚", "🖐", "✋", "🖖", "👌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏"],
  "Сердца": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"],
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const handleSelect = (emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(emoji);
    onClose();
  };

  return (
    <View className="bg-secondary/95 border-t border-accent/20" style={{ maxHeight: 300 }}>
      <ScrollView className="p-4">
        {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
          <View key={category} className="mb-4">
            <Text className="text-text-secondary text-xs mb-2 font-semibold">{category}</Text>
            <View className="flex-row flex-wrap">
              {emojis.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelect(emoji)}
                  className="w-10 h-10 items-center justify-center rounded-lg active:bg-accent/20"
                >
                  <Text className="text-2xl">{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

