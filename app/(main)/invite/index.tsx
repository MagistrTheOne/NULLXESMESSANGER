import { Card } from "@/components/ui/Card";
import { NeonGlow } from "@/components/NeonGlow";
import { useAuthStore } from "@/stores/authStore";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import { useRouter } from "expo-router";
import { ArrowLeft, Copy, Share, UserPlus } from "phosphor-react-native";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";

export default function InviteScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [copied, setCopied] = useState(false);

  const referralLink = `https://nullxes.app/invite/${user?.id || "user"}`;
  const referralCode = user?.id?.substring(0, 8).toUpperCase() || "NULLXES";

  const handleCopy = async () => {
    await Clipboard.setStringAsync(referralLink);
    setCopied(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(referralLink, {
          message: `Присоединяйся к NULLXES Messenger! Используй мою реферальную ссылку: ${referralLink}`,
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        await handleCopy();
        Alert.alert("Скопировано", "Ссылка скопирована в буфер обмена");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <View className="flex-1 bg-primary">
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-text-primary text-lg font-semibold flex-1">Пригласить друзей</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <NeonGlow color="blue" intensity="medium" animated>
          <Card className="p-6 mb-4 bg-gradient-to-br from-accent/20 to-accent/10 items-center">
            <UserPlus size={64} color="#00B7FF" weight="fill" />
            <Text className="text-text-primary text-xl font-bold mt-4 mb-2">
              Пригласи друзей
            </Text>
            <Text className="text-text-secondary text-sm text-center">
              Поделись ссылкой и получи бонусы за каждого приглашённого друга
            </Text>
          </Card>
        </NeonGlow>

        <Card className="p-4 mb-4">
          <Text className="text-text-primary text-base font-semibold mb-4">Реферальная ссылка</Text>
          <View className="bg-secondary/60 rounded-xl p-4 mb-4">
            <Text className="text-text-primary text-sm break-all">{referralLink}</Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleCopy}
              className="flex-1 bg-accent px-4 py-3 rounded-xl flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Copy size={20} color="#FFFFFF" weight="fill" />
              <Text className="text-white font-semibold ml-2">
                {copied ? "Скопировано!" : "Копировать"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              className="flex-1 bg-secondary/60 px-4 py-3 rounded-xl flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Share size={20} color="#FFFFFF" weight="fill" />
              <Text className="text-white font-semibold ml-2">Поделиться</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card className="p-4 mb-4">
          <Text className="text-text-primary text-base font-semibold mb-4">Реферальный код</Text>
          <View className="bg-secondary/60 rounded-xl p-4 items-center">
            <Text className="text-accent text-2xl font-bold">{referralCode}</Text>
            <Text className="text-text-muted text-xs mt-2">
              Друзья могут использовать этот код при регистрации
            </Text>
          </View>
        </Card>

        <Card className="p-4">
          <Text className="text-text-primary text-base font-semibold mb-4">Статистика</Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-text-primary text-2xl font-bold">0</Text>
              <Text className="text-text-muted text-xs mt-1">Приглашено</Text>
            </View>
            <View className="items-center">
              <Text className="text-text-primary text-2xl font-bold">0</Text>
              <Text className="text-text-muted text-xs mt-1">Активных</Text>
            </View>
            <View className="items-center">
              <Text className="text-text-primary text-2xl font-bold">0 ₽</Text>
              <Text className="text-text-muted text-xs mt-1">Бонусов</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

