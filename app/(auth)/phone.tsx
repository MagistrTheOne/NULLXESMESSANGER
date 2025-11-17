import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { validatePhone, formatPhone } from "@/lib/utils/validation";
import { useAuthStore } from "@/stores/authStore";
import { getUserByPhone, createUser } from "@/lib/api/db";

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

      setUser({
        id: user.id,
        phone: user.phone,
        name: user.name || undefined,
        avatar: user.avatar || undefined,
        status: user.status || undefined,
      });

      router.push("/(auth)/verify");
    } catch (err) {
      setError("Ошибка при входе. Попробуйте снова.");
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

