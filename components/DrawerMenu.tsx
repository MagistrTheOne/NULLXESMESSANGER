import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useRouter } from "expo-router";
import {
  AddressBook,
  Bookmark,
  Gear,
  Moon,
  Phone,
  Question,
  Smiley,
  Sparkle,
  Sun,
  User,
  UserPlus,
  Users,
  Wallet,
} from "phosphor-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Avatar } from "./ui/Avatar";

export function DrawerMenu() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const setDrawerOpen = useUIStore((state) => state.setDrawerOpen);

  const menuItems = [
    { icon: User, label: "Мой профиль", route: "/(main)/profile" },
    { icon: Smiley, label: "Сменить статус", route: "/(main)/profile" },
    { icon: Wallet, label: "Кошелёк", route: "/(main)/wallet" },
    { icon: Users, label: "Создать группу", route: "/(main)/chats/new" },
    { icon: AddressBook, label: "Контакты", route: "/(main)/contacts" },
    { icon: Phone, label: "Звонки", route: "/(main)/calls" },
    { icon: Bookmark, label: "Избранное", route: "/(main)/favorites" },
    { icon: Gear, label: "Настройки", route: "/(main)/settings" },
    { icon: UserPlus, label: "Пригласить друзей", route: "/(main)/invite" },
    { icon: Question, label: "Возможности Telegram", route: "/(main)/features" },
  ];

  const handleNavigate = (route: string | null) => {
    if (route) {
      router.push(route as any);
      setDrawerOpen(false);
    }
  };

  return (
    <View className="flex-1 bg-primary">
      <View className="pt-12 pb-4 px-4 border-b border-accent/10">
        <View className="flex-row items-center justify-between mb-4">
          <Avatar uri={user?.avatar} name={user?.name || user?.phone} size={64} showBorder />
          <TouchableOpacity
            onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2"
          >
            {theme === "dark" ? (
              <Sun size={24} color="#FFFFFF" />
            ) : (
              <Moon size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
        <Text className="text-text-primary text-lg font-bold mb-1">
          {user?.name || "Пользователь"} <Text>👋</Text>
        </Text>
        <Text className="text-text-muted text-sm">{user?.phone}</Text>
      </View>

      <ScrollView className="flex-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleNavigate(item.route)}
              className="flex-row items-center px-4 py-3 active:bg-secondary/40"
            >
              <Icon size={24} color="#B0B8C0" weight="regular" />
              <Text className="text-text-secondary text-base ml-4">{item.label}</Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          onPress={() => {
            router.push("/(main)/anna");
            setDrawerOpen(false);
          }}
          className="flex-row items-center px-4 py-3 mt-2 border-t border-accent/10 active:bg-secondary/40"
        >
          <Sparkle size={24} color="#00B7FF" weight="fill" />
          <Text className="text-accent text-base ml-4 font-semibold">Shadow AI — Anna</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

