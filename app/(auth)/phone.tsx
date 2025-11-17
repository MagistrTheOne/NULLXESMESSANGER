import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createUser, getUserByPhone } from "@/lib/api/db";
import { generateVerificationCode, storeVerificationCode } from "@/lib/utils/codeVerification";
import { formatPhone, validatePhone } from "@/lib/utils/validation";
import { useAuthStore } from "@/stores/authStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Text, View } from "react-native";

export default function PhoneScreen() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleContinue = async () => {
    setError("");
    
    if (!validatePhone(phone)) {
      setError("Введите корректный номер телефона");
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhone(phone);
      let user = await getUserByPhone(formattedPhone);
      
      if (!user) {
        user = await createUser(formattedPhone);
      }

      const verificationCode = generateVerificationCode();
      await storeVerificationCode(formattedPhone, verificationCode);

      setUser({
        id: user.id,
        phone: user.phone,
        name: user.name || undefined,
        avatar: user.avatar || undefined,
        status: user.status || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        "Код отправлен",
        `Код подтверждения: ${verificationCode}\n\n(В продакшене код будет отправлен через SMS)`,
        [{ text: "OK", onPress: () => router.push("/(auth)/verify") }]
      );
    } catch (err) {
      setError("Ошибка при входе. Попробуйте снова.");
      console.error(err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
          <Text className="text-text-primary text-3xl font-bold mb-2 text-center">
            NULLXES
          </Text>
          <Text className="text-text-secondary text-base mb-8 text-center">
            Введите номер телефона для входа
          </Text>

          <Input
            label="Номер телефона"
            placeholder="+7 (999) 123-45-67"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            error={error}
            autoFocus
          />

          <Button
            title="Продолжить"
            onPress={handleContinue}
            loading={loading}
            disabled={!phone}
            className="mt-4"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

