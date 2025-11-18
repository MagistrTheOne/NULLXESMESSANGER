import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/stores/authStore";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ArrowLeft, Eye, EyeSlash, Fingerprint, Lock, Shield, ShieldCheck } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";

export default function SecuritySettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>("");
  
  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
    loadBiometricSetting();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      setBiometricAvailable(compatible && enrolled);
      
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType("Face ID");
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType("Touch ID");
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        setBiometricType("Iris");
      } else {
        setBiometricType("Biometric");
      }
    } catch (error) {
      console.error("Error checking biometric availability:", error);
      setBiometricAvailable(false);
    }
  };

  const loadBiometricSetting = async () => {
    try {
      const enabled = await SecureStore.getItemAsync("biometricEnabled");
      setBiometricEnabled(enabled === "true");
    } catch (error) {
      console.error("Error loading biometric setting:", error);
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    if (!biometricAvailable) {
      Alert.alert("Недоступно", "Биометрическая аутентификация недоступна на этом устройстве");
      return;
    }

    if (value) {
      // Test biometric authentication
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Подтвердите для включения биометрии",
          cancelLabel: "Отмена",
        });

        if (result.success) {
          await SecureStore.setItemAsync("biometricEnabled", "true");
          setBiometricEnabled(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      } catch (error) {
        console.error("Error authenticating:", error);
        Alert.alert("Ошибка", "Не удалось включить биометрию");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } else {
      await SecureStore.setItemAsync("biometricEnabled", "false");
      setBiometricEnabled(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Ошибка", "Заполните все поля");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Ошибка", "Пароль должен содержать минимум 6 символов");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Ошибка", "Пароли не совпадают");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement password change API call
      // await changePassword(currentPassword, newPassword);
      
      Alert.alert("Успех", "Пароль успешно изменён");
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error changing password:", error);
      Alert.alert("Ошибка", "Не удалось изменить пароль");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-primary">
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-text-primary text-lg font-semibold flex-1">Безопасность</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <Card className="p-4 mb-4">
          <Text className="text-text-primary text-base font-semibold mb-4">Аутентификация</Text>
          
          <View className="flex-row items-center justify-between py-3 border-b border-accent/10">
            <View className="flex-row items-center flex-1">
              {biometricType === "Face ID" || biometricType === "Touch ID" ? (
                <Fingerprint size={20} color="#00b7ff" />
              ) : (
                <Shield size={20} color="#00b7ff" />
              )}
              <View className="ml-3 flex-1">
                <Text className="text-text-primary font-semibold">
                  {biometricType || "Биометрическая аутентификация"}
                </Text>
                <Text className="text-text-secondary text-xs mt-1">
                  {biometricAvailable
                    ? "Использовать биометрию для входа"
                    : "Недоступно на этом устройстве"}
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              disabled={!biometricAvailable}
              trackColor={{ false: "#374151", true: "#00b7ff" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity
            onPress={() => setShowPasswordForm(!showPasswordForm)}
            className="flex-row items-center justify-between py-3"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center flex-1">
              <Lock size={20} color="#00b7ff" />
              <View className="ml-3 flex-1">
                <Text className="text-text-primary font-semibold">Изменить пароль</Text>
                <Text className="text-text-secondary text-xs mt-1">
                  Обновить пароль для входа
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {showPasswordForm && (
            <View className="mt-4 pt-4 border-t border-accent/10">
              <Input
                label="Текущий пароль"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Введите текущий пароль"
                secureTextEntry={!showCurrentPassword}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="p-2"
                  >
                    {showCurrentPassword ? (
                      <EyeSlash size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </TouchableOpacity>
                }
              />
              <Input
                label="Новый пароль"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Введите новый пароль"
                secureTextEntry={!showNewPassword}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    className="p-2"
                  >
                    {showNewPassword ? (
                      <EyeSlash size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </TouchableOpacity>
                }
              />
              <Input
                label="Подтвердите пароль"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Повторите новый пароль"
                secureTextEntry={!showConfirmPassword}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-2"
                  >
                    {showConfirmPassword ? (
                      <EyeSlash size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </TouchableOpacity>
                }
              />
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="flex-1 bg-secondary/60 rounded-xl py-3 items-center"
                >
                  <Text className="text-text-secondary font-semibold">Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleChangePassword}
                  disabled={loading}
                  className="flex-1 bg-accent rounded-xl py-3 items-center"
                >
                  <Text className="text-white font-semibold">
                    {loading ? "Сохранение..." : "Сохранить"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Card>

        <Card className="p-4 mb-4">
          <Text className="text-text-primary text-base font-semibold mb-4">Безопасность аккаунта</Text>
          
          <View className="flex-row items-center py-3 border-b border-accent/10">
            <ShieldCheck size={20} color="#00b7ff" />
            <View className="ml-3 flex-1">
              <Text className="text-text-primary font-semibold">Двухфакторная аутентификация</Text>
              <Text className="text-text-secondary text-xs mt-1">
                Дополнительная защита аккаунта
              </Text>
            </View>
            <Text className="text-text-muted text-xs">Скоро</Text>
          </View>

          <View className="flex-row items-center py-3">
            <Shield size={20} color="#00b7ff" />
            <View className="ml-3 flex-1">
              <Text className="text-text-primary font-semibold">Активные сессии</Text>
              <Text className="text-text-secondary text-xs mt-1">
                Управление устройствами
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(main)/profile/sessions" as any)}
              className="p-2"
            >
              <Text className="text-accent text-sm">Открыть</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card className="p-4 mb-4">
          <Text className="text-text-secondary text-sm">
            Рекомендуется использовать биометрическую аутентификацию и регулярно менять пароль для обеспечения безопасности вашего аккаунта.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}


