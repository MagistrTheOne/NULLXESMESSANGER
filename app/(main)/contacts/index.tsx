import { Avatar } from "@/components/ui/Avatar";
import { addContact, deleteContact, getUserContacts } from "@/lib/api/db";
import { useAuthStore } from "@/stores/authStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ArrowLeft, MagnifyingGlass, Plus, Trash, UserPlus, X } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import * as Contacts from "expo-contacts";

export default function ContactsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadContacts();
    }
  }, [user?.id]);

  const loadContacts = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const userContacts = await getUserContacts(user.id);
      setContacts(userContacts);
    } catch (error) {
      console.error("Error loading contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncContacts = async () => {
    if (!user?.id) return;
    setSyncing(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Ошибка", "Нужно разрешение на доступ к контактам");
        setSyncing(false);
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name, Contacts.Fields.Image],
      });

      for (const contact of data) {
        if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
          const phone = contact.phoneNumbers[0].number.replace(/\s/g, "");
          await addContact(user.id, null, phone, contact.name || undefined, contact.imageUri || undefined);
        }
      }

      await loadContacts();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Успех", "Контакты синхронизированы");
    } catch (error) {
      console.error("Error syncing contacts:", error);
      Alert.alert("Ошибка", "Не удалось синхронизировать контакты");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Удалить контакт?",
      "Вы уверены, что хотите удалить этот контакт?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteContact(contactId);
              await loadContacts();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error("Error deleting contact:", error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
        },
      ]
    );
  };

  const filteredContacts = contacts.filter((contact) => {
    const query = searchQuery.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(query) ||
      contact.phone?.toLowerCase().includes(query)
    );
  });

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
          <Text className="text-text-primary text-lg font-semibold flex-1">Контакты</Text>
          <TouchableOpacity
            onPress={handleSyncContacts}
            disabled={syncing}
            className="bg-accent px-4 py-2 rounded-full"
          >
            <Text className="text-white font-semibold text-sm">
              {syncing ? "Синхронизация..." : "Синхронизировать"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-secondary/60 rounded-xl px-4 py-2">
          <MagnifyingGlass size={20} color="#6B7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Поиск контактов..."
            placeholderTextColor="#6B7280"
            className="flex-1 ml-2 text-text-primary text-base"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-secondary">Загрузка...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="px-4 py-3 bg-secondary/40 border-b border-accent/10 flex-row items-center"
              activeOpacity={0.7}
            >
              <Avatar uri={item.avatar} name={item.name || item.phone} size={48} />
              <View className="ml-3 flex-1">
                <Text className="text-text-primary font-semibold">{item.name || "Без имени"}</Text>
                <Text className="text-text-secondary text-sm">{item.phone}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteContact(item.id)}
                className="ml-2 p-2"
              >
                <Trash size={20} color="#FF1A4B" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-6 mt-20">
              <UserPlus size={64} color="#6B7280" weight="thin" />
              <Text className="text-text-muted text-base mt-4 text-center">
                {searchQuery ? "Контакты не найдены" : "Нет контактов"}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  onPress={handleSyncContacts}
                  className="mt-4 bg-accent px-6 py-3 rounded-full"
                >
                  <Text className="text-white font-semibold">Синхронизировать контакты</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </KeyboardAvoidingView>
  );
}

