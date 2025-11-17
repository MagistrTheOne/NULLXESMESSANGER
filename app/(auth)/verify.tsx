import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authenticateWithBiometric, isBiometricAvailable } from "@/lib/utils/biometric";
import { clearVerificationCode, verifyCode } from "@/lib/utils/codeVerification";
import { isBiometricEnabled, setAuthToken } from "@/lib/utils/secureStorage";
import { validateCode } from "@/lib/utils/validation";
import { useAuthStore } from "@/stores/authStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Fingerprint } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from "react-native";

export default function VerifyScreen() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const available = await isBiometricAvailable();
    const enabled = await isBiometricEnabled();
    setBiometricAvailable(available && enabled);
  };

  const handleBiometricAuth = async () => {
    const authenticated = await authenticateWithBiometric();
    if (authenticated) {
      router.replace("/(main)/chats");
    }
  };

  const handleVerify = async () => {
    setError("");
    
    if (!validateCode(code)) {
      setError("Введите корректный код");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (!user?.phone) {
      setError("Ошибка: номер телефона не найден");
      return;
    }

    setLoading(true);
    try {
      const isValid = await verifyCode(user.phone, code);
      
      if (isValid) {
        await clearVerificationCode();
        await setAuthToken(`token_${user.id}_${Date.now()}`);
        await updateUserOnlineStatus(user.id, "online");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(main)/chats");
      } else {
        setError("Неверный код или код истёк");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err) {
      setError("Ошибка при проверке кода");
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

          {biometricAvailable && (
            <TouchableOpacity
              onPress={handleBiometricAuth}
              className="mt-4 flex-row items-center justify-center"
            >
              <Fingerprint size={24} color="#00B7FF" />
              <Text className="text-accent text-base ml-2">Войти с биометрией</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

