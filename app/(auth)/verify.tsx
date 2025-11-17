import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { validateCode } from "@/lib/utils/validation";
import { useAuthStore } from "@/stores/authStore";

export default function VerifyScreen() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const handleVerify = async () => {
    setError("");
    
    if (!validateCode(code)) {
      setError("Введите корректный код");
      return;
    }

    setLoading(true);
    try {
      // В реальном приложении здесь была бы проверка кода через API
      // Для демо просто проверяем длину
      if (code.length >= 4) {
        router.replace("/(main)/chats");
      } else {
        setError("Неверный код");
      }
    } catch (err) {
      setError("Ошибка при проверке кода");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-primary"
    >
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-sm">
          <Text className="text-text-primary text-2xl font-bold mb-2 text-center">
            Подтверждение
          </Text>
          <Text className="text-text-secondary text-base mb-2 text-center">
            Код отправлен на {user?.phone}
          </Text>
          <Text className="text-text-muted text-sm mb-8 text-center">
            Введите код подтверждения
          </Text>

          <Input
            label="Код подтверждения"
            placeholder="0000"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            error={error}
            autoFocus
          />

          <Button
            title="Подтвердить"
            onPress={handleVerify}
            loading={loading}
            disabled={!code}
            className="mt-4"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

