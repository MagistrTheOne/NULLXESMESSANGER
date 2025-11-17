import { Card } from "@/components/ui/Card";
import { anonymizeUserData, deleteUserAccount, exportUserData } from "@/lib/api/gdpr";
import { authenticateWithBiometric, getSupportedBiometricType, isBiometricAvailable } from "@/lib/utils/biometric";
import { isBiometricEnabled, setBiometricEnabled as setBiometricEnabledStorage } from "@/lib/utils/secureStorage";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "expo-router";
import { ArrowLeft, Download, Fingerprint, Lock, Shield, Trash } from "phosphor-react-native";
import React, { useState } from "react";
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";

export default function PrivacyScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadBiometricSettings();
  }, []);

  const loadBiometricSettings = async () => {
    const enabled = await isBiometricEnabled();
    const type = await getSupportedBiometricType();
    setBiometricEnabledState(enabled);
    setBiometricType(type);
  };

  const handleToggleBiometric = async (value: boolean) => {
    if (value) {
      const available = await isBiometricAvailable();
      if (!available) {
        Alert.alert("Недоступно", "Биометрическая аутентификация недоступна на этом устройстве");
        return;
      }

      const authenticated = await authenticateWithBiometric();
      if (authenticated) {
        await setBiometricEnabledStorage(true);
        setBiometricEnabledState(true);
      }
    } else {
      await setBiometricEnabledStorage(false);
      setBiometricEnabledState(false);
    }
  };

  const handleExportData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const fileUri = await exportUserData(user.id);
      if (fileUri) {
        Alert.alert("Успешно", "Данные экспортированы");
      } else {
        Alert.alert("Ошибка", "Не удалось экспортировать данные");
      }
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось экспортировать данные");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    Alert.alert(
      "Удаление аккаунта",
      "Вы уверены? Это действие необратимо. Все ваши данные будут удалены.",
      [
        {
          text: "Отмена",
          style: "cancel",
        },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const success = await deleteUserAccount(user.id);
              if (success) {
                logout();
                router.replace("/(auth)/phone");
              } else {
                Alert.alert("Ошибка", "Не удалось удалить аккаунт");
              }
            } catch (error) {
              Alert.alert("Ошибка", "Не удалось удалить аккаунт");
              console.error(error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleAnonymizeData = async () => {
    if (!user?.id) return;

    Alert.alert(
      "Анонимизация данных",
      "Ваши персональные данные будут анонимизированы, но аккаунт останется активным.",
      [
        {
          text: "Отмена",
          style: "cancel",
        },
        {
          text: "Анонимизировать",
          onPress: async () => {
            setLoading(true);
            try {
              const success = await anonymizeUserData(user.id);
              if (success) {
                Alert.alert("Успешно", "Данные анонимизированы");
                logout();
                router.replace("/(auth)/phone");
              } else {
                Alert.alert("Ошибка", "Не удалось анонимизировать данные");
              }
            } catch (error) {
              Alert.alert("Ошибка", "Не удалось анонимизировать данные");
              console.error(error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-primary">
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-text-primary text-lg font-semibold">Приватность и безопасность</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <Card className="p-4 mb-4">
          <View className="flex-row items-center mb-4">
            <View className="mr-3">
              <Fingerprint size={24} color="#00B7FF" />
            </View>
            <View className="flex-1">
              <Text className="text-text-primary text-base font-semibold">
                Биометрическая аутентификация
              </Text>
              {biometricType && (
                <Text className="text-text-muted text-xs mt-1">{biometricType}</Text>
              )}
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              trackColor={{ false: "#1F2937", true: "#00B7FF" }}
              thumbColor="#FFFFFF"
              disabled={!biometricType}
            />
          </View>
          <Text className="text-text-muted text-sm">
            Использовать {biometricType || "биометрию"} для быстрого входа
          </Text>
        </Card>

        <Card className="p-4 mb-4">
          <View className="flex-row items-center mb-2">
            <View className="mr-3">
              <Shield size={24} color="#00B7FF" />
            </View>
            <Text className="text-text-primary text-base font-semibold">Защита данных</Text>
          </View>
          <Text className="text-text-muted text-sm mb-4">
            Управление персональными данными в соответствии с ФЗ-152, GDPR, CCPA и другими требованиями
          </Text>

          <TouchableOpacity
            onPress={handleExportData}
            className="flex-row items-center py-3 border-b border-accent/10"
            disabled={loading}
          >
            <View className="mr-3">
              <Download size={20} color="#00B7FF" />
            </View>
            <Text className="text-text-secondary text-base flex-1">Экспорт данных</Text>
            <Text className="text-text-muted text-xs">JSON</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAnonymizeData}
            className="flex-row items-center py-3 border-b border-accent/10"
            disabled={loading}
          >
            <View className="mr-3">
              <Lock size={20} color="#FFA500" />
            </View>
            <Text className="text-text-secondary text-base flex-1">Анонимизировать данные</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteAccount}
            className="flex-row items-center py-3"
            disabled={loading}
          >
            <View className="mr-3">
              <Trash size={20} color="#FF1A4B" />
            </View>
            <Text className="text-danger text-base flex-1">Удалить аккаунт</Text>
          </TouchableOpacity>
        </Card>

        <Card className="p-4 mb-4">
          <Text className="text-text-primary text-base font-semibold mb-2">Политика конфиденциальности</Text>
          <Text className="text-text-muted text-sm mb-3">
            Мы защищаем ваши данные в соответствии с:
          </Text>
          <View className="mb-3">
            <Text className="text-text-secondary text-sm mb-1">• ФЗ-152 "О персональных данных" (РФ)</Text>
            <Text className="text-text-secondary text-sm mb-1">• GDPR (Европейский Союз)</Text>
            <Text className="text-text-secondary text-sm mb-1">• CCPA (Калифорния, США)</Text>
            <Text className="text-text-secondary text-sm">• LGPD (Бразилия)</Text>
          </View>
          <Text className="text-text-muted text-sm mb-4">
            Применяем современные методы шифрования и безопасного хранения данных.
          </Text>
          <TouchableOpacity className="py-2">
            <Text className="text-accent text-sm">Читать политику конфиденциальности</Text>
          </TouchableOpacity>
        </Card>

        <Card className="p-4 mb-4">
          <Text className="text-text-primary text-base font-semibold mb-2">Права субъекта персональных данных</Text>
          <Text className="text-text-muted text-sm mb-3">
            В соответствии с ФЗ-152 и GDPR вы имеете право:
          </Text>
          <View className="mb-3">
            <Text className="text-text-secondary text-sm mb-1">• Получать информацию об обработке данных</Text>
            <Text className="text-text-secondary text-sm mb-1">• Требовать уточнения, блокировки или удаления</Text>
            <Text className="text-text-secondary text-sm mb-1">• Отозвать согласие на обработку</Text>
            <Text className="text-text-secondary text-sm mb-1">• Обжаловать действия оператора</Text>
            <Text className="text-text-secondary text-sm">• Получить копию ваших данных (экспорт)</Text>
          </View>
        </Card>

        <Card className="p-4 mb-4">
          <Text className="text-text-primary text-base font-semibold mb-2">Безопасность данных</Text>
          <View className="mb-3">
            <Text className="text-text-secondary text-sm mb-1">• Шифрование данных при передаче (TLS/SSL)</Text>
            <Text className="text-text-secondary text-sm mb-1">• Безопасное хранение токенов (SecureStore)</Text>
            <Text className="text-text-secondary text-sm mb-1">• Биометрическая аутентификация</Text>
            <Text className="text-text-secondary text-sm mb-1">• Регулярные аудиты безопасности</Text>
            <Text className="text-text-secondary text-sm">• Соответствие требованиям Роскомнадзора</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

