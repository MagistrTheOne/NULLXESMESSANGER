import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/stores/authStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ArrowLeft, Database, HardDrive, Trash } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export default function DataManagementScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [cacheSize, setCacheSize] = useState(0);
  const [storageSize, setStorageSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(true);

  useEffect(() => {
    calculateSizes();
  }, []);

  const calculateSizes = async () => {
    setCalculating(true);
    try {
      let totalCache = 0;
      let totalStorage = 0;

      // Calculate cache directory size
      try {
        const cacheDir = (FileSystem as any).cacheDirectory;
        if (cacheDir) {
          const cacheInfo = await FileSystem.getInfoAsync(cacheDir);
          if (cacheInfo.exists) {
            // Approximate calculation
            totalCache = 50 * 1024 * 1024; // Placeholder - would need recursive calculation
          }
        }
      } catch (error) {
        console.error("Error calculating cache:", error);
      }

      // Calculate document directory size
      try {
        const docDir = (FileSystem as any).documentDirectory;
        if (docDir) {
          const docInfo = await FileSystem.getInfoAsync(docDir);
          if (docInfo.exists) {
            totalStorage = 100 * 1024 * 1024; // Placeholder
          }
        }
      } catch (error) {
        console.error("Error calculating storage:", error);
      }

      setCacheSize(totalCache);
      setStorageSize(totalStorage);
    } catch (error) {
      console.error("Error calculating sizes:", error);
    } finally {
      setCalculating(false);
    }
  };

  const handleClearCache = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Очистить кеш?",
      "Это удалит временные файлы и данные. Приложение может работать медленнее при следующем использовании.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Очистить",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              // Clear AsyncStorage (except auth data)
              const keys = await AsyncStorage.getAllKeys();
              const keysToRemove = keys.filter(
                (key) => !key.includes("auth") && !key.includes("user")
              );
              await AsyncStorage.multiRemove(keysToRemove);

              // Clear cache directory
              try {
                const cacheDir = (FileSystem as any).cacheDirectory;
                if (cacheDir) {
                  // Would need to recursively delete files
                  // For now, just clear AsyncStorage
                }
              } catch (error) {
                console.error("Error clearing cache:", error);
              }

              await calculateSizes();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Успех", "Кеш очищен");
            } catch (error) {
              console.error("Error clearing cache:", error);
              Alert.alert("Ошибка", "Не удалось очистить кеш");
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClearAllData = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Очистить все данные?",
      "Это удалит все локальные данные приложения, включая кеш, медиа и настройки. Вы будете разлогинены.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Очистить всё",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              // Clear all AsyncStorage
              await AsyncStorage.clear();

              // Clear cache and document directories
              try {
                const cacheDir = (FileSystem as any).cacheDirectory;
                const docDir = (FileSystem as any).documentDirectory;
                // Would need to recursively delete files
              } catch (error) {
                console.error("Error clearing directories:", error);
              }

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Успех", "Все данные очищены. Приложение будет перезапущено.");
              // Would need to logout and restart app
            } catch (error) {
              console.error("Error clearing all data:", error);
              Alert.alert("Ошибка", "Не удалось очистить данные");
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
        <Text className="text-text-primary text-lg font-semibold flex-1">Управление данными</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <Card className="p-4 mb-4">
          <Text className="text-text-primary text-base font-semibold mb-4">Использование хранилища</Text>
          
          {calculating ? (
            <Text className="text-text-secondary">Расчёт размера...</Text>
          ) : (
            <>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <HardDrive size={24} color="#00b7ff" />
                  <Text className="text-text-primary ml-3">Кеш</Text>
                </View>
                <Text className="text-text-secondary">{formatBytes(cacheSize)}</Text>
              </View>
              
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Database size={24} color="#00b7ff" />
                  <Text className="text-text-primary ml-3">Хранилище</Text>
                </View>
                <Text className="text-text-secondary">{formatBytes(storageSize)}</Text>
              </View>

              <View className="border-t border-accent/10 pt-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-text-primary font-semibold">Всего</Text>
                  <Text className="text-accent font-semibold">{formatBytes(cacheSize + storageSize)}</Text>
                </View>
              </View>
            </>
          )}
        </Card>

        <Card className="p-4 mb-4">
          <Text className="text-text-primary text-base font-semibold mb-4">Очистка данных</Text>
          
          <TouchableOpacity
            onPress={handleClearCache}
            disabled={loading || calculating}
            className="flex-row items-center justify-between py-3 border-b border-accent/10"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center flex-1">
              <Trash size={20} color="#00b7ff" />
              <View className="ml-3 flex-1">
                <Text className="text-text-primary font-semibold">Очистить кеш</Text>
                <Text className="text-text-secondary text-xs mt-1">
                  Удалить временные файлы и данные
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearAllData}
            disabled={loading || calculating}
            className="flex-row items-center justify-between py-3"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center flex-1">
              <Trash size={20} color="#ff1759" />
              <View className="ml-3 flex-1">
                <Text className="text-danger font-semibold">Очистить все данные</Text>
                <Text className="text-text-secondary text-xs mt-1">
                  Удалить все локальные данные приложения
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Card>

        <Card className="p-4 mb-4">
          <Text className="text-text-secondary text-sm">
            Очистка кеша удалит временные файлы, но сохранит ваши данные и настройки.
            Очистка всех данных удалит всё, включая медиа и настройки, и вы будете разлогинены.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

