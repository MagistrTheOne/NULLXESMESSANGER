import { NeonGlow } from "@/components/NeonGlow";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createChat } from "@/lib/api/db";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ArrowLeft, MagnifyingGlass } from "phosphor-react-native";
import React, { useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function NewChatScreen() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const addChat = useChatStore((state) => state.addChat);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [chatName, setChatName] = useState("");
  const [chatAvatar, setChatAvatar] = useState<string | undefined>(undefined);
  const [chatDescription, setChatDescription] = useState("");
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      loadUsers();
    }
  }, [currentUser?.id]);

  const loadUsers = async () => {
    if (!currentUser?.id) return;
    try {
      const contacts = await getUserContacts(currentUser.id);
      setAvailableUsers(contacts);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Ошибка", "Нужно разрешение на доступ к фото");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setChatAvatar(result.assets[0].uri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error("Error picking avatar:", error);
    }
  };

  const toggleUserSelection = (userId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert("Ошибка", "Выберите хотя бы одного пользователя");
      return;
    }

    if (!currentUser?.id) {
      Alert.alert("Ошибка", "Пользователь не авторизован");
      return;
    }

    setLoading(true);
    try {
      const memberIds = [currentUser.id, ...selectedUsers];
      const chatType = selectedUsers.length === 1 ? "private" : "group";
      const name = chatType === "group" && chatName ? chatName : undefined;

      const chat = await createChat(chatType, memberIds, name, chatAvatar);

      addChat({
        id: chat.id,
        type: chatType,
        name: chat.name || undefined,
        avatar: chat.avatar || undefined,
        lastMessage: undefined,
        lastMessageAt: undefined,
        unreadCount: 0,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/(main)/chat/${chat.id}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      Alert.alert("Ошибка", "Не удалось создать чат");
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
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-text-primary text-lg font-semibold flex-1">
            Новый чат
          </Text>
        </View>

        <View className="flex-row items-center bg-secondary/60 rounded-xl px-4 py-2 mb-4">
          <MagnifyingGlass size={20} color="#6B7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Поиск пользователей..."
            placeholderTextColor="#6B7280"
            className="flex-1 ml-2 text-text-primary text-base"
          />
        </View>

        {selectedUsers.length > 1 && (
          <>
            <TouchableOpacity
              onPress={handlePickAvatar}
              className="items-center mb-4"
            >
              {chatAvatar ? (
                <View className="relative">
                  <Avatar uri={chatAvatar} name={chatName} size={80} />
                  <View className="absolute bottom-0 right-0 bg-accent rounded-full p-2">
                    <ImageIcon size={16} color="#FFFFFF" />
                  </View>
                </View>
              ) : (
                <View className="w-20 h-20 bg-secondary/60 rounded-full items-center justify-center border-2 border-dashed border-accent/30">
                  <ImageIcon size={32} color="#00B7FF" />
                  <Text className="text-accent text-xs mt-1">Аватар</Text>
                </View>
              )}
            </TouchableOpacity>
            <Input
              label="Название группы"
              placeholder="Введите название группы"
              value={chatName}
              onChangeText={setChatName}
              className="mb-4"
            />
            <Input
              label="Описание (необязательно)"
              placeholder="Введите описание группы"
              value={chatDescription}
              onChangeText={setChatDescription}
              className="mb-4"
              multiline
            />
          </>
        )}
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = selectedUsers.includes(item.id);
          return (
            <TouchableOpacity
              onPress={() => toggleUserSelection(item.id)}
              className={`flex-row items-center px-4 py-3 ${
                isSelected ? "bg-accent/20" : "bg-secondary/40"
              } active:bg-secondary/60`}
            >
              <Avatar uri={item.avatar} name={item.name} size={48} showBorder={isSelected} />
              <View className="flex-1 ml-3">
                <Text className="text-text-primary font-semibold text-base">{item.name}</Text>
                <Text className="text-text-muted text-sm">{item.phone}</Text>
              </View>
              {isSelected && (
                <NeonGlow color="blue" intensity="low">
                  <View className="w-6 h-6 bg-accent rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">✓</Text>
                  </View>
                </NeonGlow>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Text className="text-text-muted text-base">Пользователи не найдены</Text>
          </View>
        }
      />

      {selectedUsers.length > 0 && (
        <View className="px-4 py-4 bg-secondary/40 border-t border-accent/10">
          <NeonGlow color="blue" intensity="medium">
            <Button
              title={`Создать ${selectedUsers.length === 1 ? "чат" : "группу"}`}
              onPress={handleCreateChat}
              loading={loading}
              className="w-full"
            />
          </NeonGlow>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

