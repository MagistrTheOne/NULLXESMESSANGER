import { Card } from "@/components/ui/Card";
import { NeonGlow } from "@/components/NeonGlow";
import { useAuthStore } from "@/stores/authStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ArrowLeft, CreditCard, Wallet, Plus, ArrowUpRight, ArrowDownLeft } from "phosphor-react-native";
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

export default function WalletScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  return (
    <View className="flex-1 bg-primary">
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-text-primary text-lg font-semibold flex-1">Кошелёк</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <NeonGlow color="blue" intensity="medium" animated>
          <Card className="p-6 mb-4 bg-gradient-to-br from-accent/20 to-accent/10">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-text-secondary text-sm mb-1">Баланс</Text>
                <Text className="text-text-primary text-3xl font-bold">0 ₽</Text>
              </View>
              <Wallet size={48} color="#00B7FF" weight="fill" />
            </View>
            <Text className="text-text-muted text-xs">
              Интеграция с платежной системой в разработке
            </Text>
          </Card>
        </NeonGlow>

        <View className="flex-row gap-4 mb-6">
          <TouchableOpacity
            className="flex-1 bg-secondary/60 p-4 rounded-xl items-center"
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <NeonGlow color="blue" intensity="low">
              <View className="bg-accent/20 rounded-full p-3 mb-2">
                <ArrowDownLeft size={24} color="#00B7FF" weight="fill" />
              </View>
            </NeonGlow>
            <Text className="text-text-primary font-semibold">Пополнить</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-secondary/60 p-4 rounded-xl items-center"
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <NeonGlow color="blue" intensity="low">
              <View className="bg-accent/20 rounded-full p-3 mb-2">
                <ArrowUpRight size={24} color="#00B7FF" weight="fill" />
              </View>
            </NeonGlow>
            <Text className="text-text-primary font-semibold">Вывести</Text>
          </TouchableOpacity>
        </View>

        <Card className="p-4 mb-4">
          <Text className="text-text-primary text-base font-semibold mb-4">Привязанные карты</Text>
          <View className="items-center py-8">
            <CreditCard size={48} color="#6B7280" weight="thin" />
            <Text className="text-text-muted text-base mt-4 text-center">
              Нет привязанных карт
            </Text>
            <TouchableOpacity
              className="mt-4 bg-accent px-6 py-3 rounded-full"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text className="text-white font-semibold">Добавить карту</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card className="p-4">
          <Text className="text-text-primary text-base font-semibold mb-4">История операций</Text>
          <View className="items-center py-8">
            <Text className="text-text-muted text-base text-center">
              История операций пуста
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

