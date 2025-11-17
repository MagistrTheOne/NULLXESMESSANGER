import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { updateUser } from "@/lib/api/db";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function GDPRConsentScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [dataProcessingConsent, setDataProcessingConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!user?.id || !gdprConsent || !dataProcessingConsent) return;

    setLoading(true);
    try {
      await updateUser(user.id, {
        gdprConsent: true,
        dataProcessingConsent: true,
        marketingConsent: marketingConsent,
        fz152Consent: true, // Согласие по ФЗ-152
      });
      router.replace("/(main)/chats");
    } catch (error) {
      console.error("Error saving consent:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-primary">
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10">
        <Text className="text-text-primary text-xl font-bold text-center">Согласие на обработку данных</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <Card className="p-4 mb-4">
          <Text className="text-text-primary text-base font-semibold mb-4">
            Политика конфиденциальности
          </Text>
          <Text className="text-text-secondary text-sm mb-3">
            Мы обрабатываем ваши персональные данные в соответствии с:
          </Text>
          <View className="mb-3">
            <Text className="text-text-secondary text-sm mb-1">• ФЗ-152 "О персональных данных" (РФ)</Text>
            <Text className="text-text-secondary text-sm mb-1">• GDPR (Европейский Союз)</Text>
            <Text className="text-text-secondary text-sm mb-1">• CCPA (Калифорния, США)</Text>
            <Text className="text-text-secondary text-sm">• LGPD (Бразилия)</Text>
          </View>
          <Text className="text-text-secondary text-sm mb-4">
            Пожалуйста, ознакомьтесь с нашей политикой конфиденциальности и дайте согласие на обработку данных.
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://nullxes.club/privacy")}
            className="py-2"
          >
            <Text className="text-accent text-sm">Читать политику конфиденциальности</Text>
          </TouchableOpacity>
        </Card>

        <Card className="p-4 mb-4">
          <TouchableOpacity
            onPress={() => setGdprConsent(!gdprConsent)}
            className="flex-row items-start mb-4"
          >
            <View
              className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 ${
                gdprConsent ? "bg-accent border-accent" : "border-accent/50"
              }`}
            >
              {gdprConsent && <Text className="text-white text-xs text-center">✓</Text>}
            </View>
            <View className="flex-1">
              <Text className="text-text-primary text-base font-semibold">
                Согласие на обработку персональных данных (обязательно)
              </Text>
              <Text className="text-text-muted text-sm mt-1">
                Я согласен на обработку моих персональных данных в соответствии с ФЗ-152 и GDPR
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDataProcessingConsent(!dataProcessingConsent)}
            className="flex-row items-start mb-4"
          >
            <View
              className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 ${
                dataProcessingConsent ? "bg-accent border-accent" : "border-accent/50"
              }`}
            >
              {dataProcessingConsent && <Text className="text-white text-xs text-center">✓</Text>}
            </View>
            <View className="flex-1">
              <Text className="text-text-primary text-base font-semibold">
                Обработка данных для работы сервиса (обязательно)
              </Text>
              <Text className="text-text-muted text-sm mt-1">
                Необходимо для функционирования мессенджера. В соответствии с ФЗ-152 ст. 9
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMarketingConsent(!marketingConsent)}
            className="flex-row items-start"
          >
            <View
              className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 ${
                marketingConsent ? "bg-accent border-accent" : "border-accent/50"
              }`}
            >
              {marketingConsent && <Text className="text-white text-xs text-center">✓</Text>}
            </View>
            <View className="flex-1">
              <Text className="text-text-primary text-base font-semibold">
                Маркетинговые сообщения (опционально)
              </Text>
              <Text className="text-text-muted text-sm mt-1">
                Получать уведомления о новых функциях и предложениях
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        <Button
          title="Принять и продолжить"
          onPress={handleAccept}
          loading={loading}
          disabled={!gdprConsent || !dataProcessingConsent}
          className="mt-4"
        />
      </ScrollView>
    </View>
  );
}

