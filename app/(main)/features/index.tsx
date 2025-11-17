import { Card } from "@/components/ui/Card";
import { NeonGlow } from "@/components/NeonGlow";
import { useRouter } from "expo-router";
import { ArrowLeft, CheckCircle, Lock, MessageText, Phone, Shield, Sparkle, VideoCamera } from "phosphor-react-native";
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

const features = [
  {
    icon: MessageText,
    title: "Безлимитные сообщения",
    description: "Отправляйте текстовые сообщения, фото, видео и файлы без ограничений",
  },
  {
    icon: Phone,
    title: "Голосовые и видеозвонки",
    description: "Высококачественные звонки с криптографической защитой",
  },
  {
    icon: Shield,
    title: "End-to-End шифрование",
    description: "Ваши сообщения защищены военной криптографией. Только вы и получатель можете их прочитать",
  },
  {
    icon: Sparkle,
    title: "Shadow AI — Anna",
    description: "Персональный AI-ассистент для технических и общих вопросов",
  },
  {
    icon: Lock,
    title: "Приватность",
    description: "Полный контроль над вашими данными. Самоуничтожающиеся сообщения и истории",
  },
  {
    icon: VideoCamera,
    title: "Stories",
    description: "Делитесь моментами своей жизни с помощью историй, которые исчезают через 24 часа",
  },
];

export default function FeaturesScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-primary">
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-text-primary text-lg font-semibold flex-1">
          Возможности NULLXES
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <NeonGlow color="blue" intensity="medium" animated>
          <Card className="p-6 mb-4 bg-gradient-to-br from-accent/20 to-accent/10 items-center">
            <Text className="text-text-primary text-2xl font-bold mb-2">NULLXES Messenger</Text>
            <Text className="text-text-secondary text-sm text-center">
              Безопасный мессенджер нового поколения с AI-ассистентом
            </Text>
          </Card>
        </NeonGlow>

        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <NeonGlow key={index} color="blue" intensity="low">
              <Card className="p-4 mb-3">
                <View className="flex-row items-start">
                  <View className="bg-accent/20 rounded-full p-3 mr-4">
                    <Icon size={24} color="#00B7FF" weight="fill" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary text-base font-semibold mb-1">
                      {feature.title}
                    </Text>
                    <Text className="text-text-secondary text-sm">
                      {feature.description}
                    </Text>
                  </View>
                </View>
              </Card>
            </NeonGlow>
          );
        })}

        <Card className="p-4 mt-4">
          <View className="flex-row items-center mb-3">
            <CheckCircle size={20} color="#00FF00" weight="fill" />
            <Text className="text-text-primary font-semibold ml-2">Преимущества</Text>
          </View>
          <View className="ml-7">
            <Text className="text-text-secondary text-sm mb-1">• Без рекламы</Text>
            <Text className="text-text-secondary text-sm mb-1">• Открытый исходный код</Text>
            <Text className="text-text-secondary text-sm mb-1">• Кроссплатформенность</Text>
            <Text className="text-text-secondary text-sm mb-1">• Синхронизация между устройствами</Text>
            <Text className="text-text-secondary text-sm">• Регулярные обновления</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

