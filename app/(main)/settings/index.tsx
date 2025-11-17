import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Bell, Lock, HardDrive, Devices, Globe, Flask } from "phosphor-react-native";
import { Card } from "@/components/ui/Card";
import { useUIStore } from "@/stores/uiStore";

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const [notifications, setNotifications] = React.useState(true);
  const [privacy, setPrivacy] = React.useState(true);

  return (
    <View className="flex-1 bg-primary">
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-text-primary text-lg font-semibold">Настройки</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <Card className="p-4 mb-4">
          <View className="flex-row items-center mb-4">
            <Bell size={24} color="#00B7FF" className="mr-3" />
            <Text className="text-text-primary text-base font-semibold flex-1">Уведомления</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#1F2937", true: "#00B7FF" }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text className="text-text-muted text-sm">Push-уведомления о новых сообщениях</Text>
        </Card>

        <Card className="p-4 mb-4">
          <View className="flex-row items-center mb-4">
            <Lock size={24} color="#00B7FF" className="mr-3" />
            <Text className="text-text-primary text-base font-semibold flex-1">Приватность</Text>
            <Switch
              value={privacy}
              onValueChange={setPrivacy}
              trackColor={{ false: "#1F2937", true: "#00B7FF" }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text className="text-text-muted text-sm">Настройки приватности и безопасности</Text>
        </Card>

        <Card className="p-4 mb-4">
          <TouchableOpacity className="flex-row items-center py-3 border-b border-accent/10">
            <HardDrive size={24} color="#00B7FF" className="mr-3" />
            <Text className="text-text-primary text-base flex-1">Хранилище</Text>
            <Text className="text-text-muted text-sm">256 MB</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center py-3">
            <Text className="text-text-secondary text-sm">Очистить кэш</Text>
          </TouchableOpacity>
        </Card>

        <Card className="p-4 mb-4">
          <TouchableOpacity className="flex-row items-center py-3 border-b border-accent/10">
            <Devices size={24} color="#00B7FF" className="mr-3" />
            <Text className="text-text-primary text-base flex-1">Подключенные устройства</Text>
          </TouchableOpacity>
        </Card>

        <Card className="p-4 mb-4">
          <TouchableOpacity className="flex-row items-center py-3">
            <Globe size={24} color="#00B7FF" className="mr-3" />
            <Text className="text-text-primary text-base flex-1">Язык</Text>
            <Text className="text-text-muted text-sm">Русский</Text>
          </TouchableOpacity>
        </Card>

        <Card className="p-4 mb-4">
          <View className="flex-row items-center mb-2">
            <Flask size={24} color="#8B5CF6" className="mr-3" />
            <Text className="text-text-primary text-base font-semibold">Experimental</Text>
          </View>
          <Text className="text-text-muted text-sm mb-4">Настройки Shadow AI — Anna</Text>
          <TouchableOpacity className="py-3 border-b border-accent/10">
            <Text className="text-text-secondary">Режимы Anna</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-3 border-b border-accent/10">
            <Text className="text-text-secondary">История разговоров</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-3">
            <Text className="text-text-secondary">API настройки</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </View>
  );
}

