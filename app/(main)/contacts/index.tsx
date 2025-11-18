import { Avatar } from "@/components/ui/Avatar";
import { addContact, blockUser, deleteContact, getBlockedUsers, getUserContacts, isUserBlocked, toggleFavoriteContact, unblockUser } from "@/lib/api/db";
import { getUserById } from "@/lib/api/db";
import { useAuthStore } from "@/stores/authStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ArrowLeft, Heart, MagnifyingGlass, Prohibit, ProhibitInset, Star, Trash, UserPlus, X } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, TextInput, Alert, KeyboardAvoidingView, Platform, SectionList, ScrollView } from "react-native";
import * as Contacts from "expo-contacts";

type ContactSection = {
  title: string;
  data: any[];
};

export default function ContactsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [contacts, setContacts] = useState<any[]>([]);
  const [sections, setSections] = useState<ContactSection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadContacts();
      loadBlockedUsers();
    }
  }, [user?.id]);

  useEffect(() => {
    if (contacts.length > 0) {
      organizeContacts();
    }
  }, [contacts, searchQuery]);

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

  const loadBlockedUsers = async () => {
    if (!user?.id) return;
    try {
      const blocked = await getBlockedUsers(user.id);
      setBlockedUsers(blocked);
    } catch (error) {
      console.error("Error loading blocked users:", error);
    }
  };

  const organizeContacts = () => {
    let filtered = contacts;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = contacts.filter((contact) => {
        return (
          contact.name?.toLowerCase().includes(query) ||
          contact.phone?.toLowerCase().includes(query)
        );
      });
    }

    // Separate favorites
    const favorites = filtered.filter((c) => c.isFavorite);
    const regular = filtered.filter((c) => !c.isFavorite);

    // Group by first letter
    const grouped: { [key: string]: any[] } = {};
    
    regular.forEach((contact) => {
      const firstLetter = (contact.name || contact.phone || "#").charAt(0).toUpperCase();
      const letter = /[А-ЯA-Z]/.test(firstLetter) ? firstLetter : "#";
      if (!grouped[letter]) {
        grouped[letter] = [];
      }
      grouped[letter].push(contact);
    });

    // Sort each group
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => {
        const nameA = (a.name || a.phone || "").toLowerCase();
        const nameB = (b.name || b.phone || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
    });

    // Create sections
    const newSections: ContactSection[] = [];
    
    if (favorites.length > 0) {
      newSections.push({
        title: "Избранное",
        data: favorites.sort((a, b) => {
          const nameA = (a.name || a.phone || "").toLowerCase();
          const nameB = (b.name || b.phone || "").toLowerCase();
          return nameA.localeCompare(nameB);
        }),
      });
    }

    const sortedLetters = Object.keys(grouped).sort();
    sortedLetters.forEach((letter) => {
      newSections.push({
        title: letter,
        data: grouped[letter],
      });
    });

    setSections(newSections);
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

  const handleToggleFavorite = async (contactId: string, isFavorite: boolean) => {
    if (!user?.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await toggleFavoriteContact(contactId, !isFavorite);
      await loadContacts();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleBlockUser = async (contactUserId: string, contactName: string) => {
    if (!user?.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Заблокировать пользователя?",
      `Вы уверены, что хотите заблокировать ${contactName}?`,
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Заблокировать",
          style: "destructive",
          onPress: async () => {
            try {
              await blockUser(user.id, contactUserId);
              await loadBlockedUsers();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Успех", "Пользователь заблокирован");
            } catch (error) {
              console.error("Error blocking user:", error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          },
        },
      ]
    );
  };

  const handleUnblockUser = async (blockedUserId: string) => {
    if (!user?.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await unblockUser(user.id, blockedUserId);
      await loadBlockedUsers();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error unblocking user:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const renderContactItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="px-4 py-3 bg-secondary/40 border-b border-accent/10 flex-row items-center"
      activeOpacity={0.7}
      onPress={() => {
        if (item.contactUserId) {
          router.push(`/(main)/chat/${item.contactUserId}` as any);
        }
      }}
    >
      <Avatar uri={item.avatar} name={item.name || item.phone} size={48} />
      <View className="ml-3 flex-1">
        <Text className="text-text-primary font-semibold">{item.name || "Без имени"}</Text>
        <Text className="text-text-secondary text-sm">{item.phone}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        {item.contactUserId && (
          <TouchableOpacity
            onPress={() => handleBlockUser(item.contactUserId, item.name || item.phone)}
            className="p-2"
          >
            <Prohibit size={20} color="#FF1A4B" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => handleToggleFavorite(item.id, item.isFavorite)}
          className="p-2"
        >
          {item.isFavorite ? (
            <Star size={20} color="#FFD700" weight="fill" />
          ) : (
            <Star size={20} color="#6B7280" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteContact(item.id)}
          className="p-2"
        >
          <Trash size={20} color="#FF1A4B" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: ContactSection }) => (
    <View className="bg-secondary/60 px-4 py-2 border-b border-accent/10">
      <Text className="text-text-secondary text-sm font-semibold">{section.title}</Text>
    </View>
  );

  const renderAlphabetIndex = () => {
    const letters = sections
      .filter((s) => s.title !== "Избранное")
      .map((s) => s.title)
      .filter((l) => l !== "#");

    if (letters.length === 0) return null;

    return (
      <View className="absolute right-2 top-20 bottom-4 justify-center">
        <ScrollView showsVerticalScrollIndicator={false}>
          {letters.map((letter) => (
            <TouchableOpacity
              key={letter}
              onPress={() => {
                const sectionIndex = sections.findIndex((s) => s.title === letter);
                if (sectionIndex >= 0) {
                  // Scroll to section
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              className="py-1"
            >
              <Text className="text-accent text-xs font-semibold">{letter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
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
          <Text className="text-text-primary text-lg font-semibold flex-1">Контакты</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => {
                setShowBlocked(!showBlocked);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="bg-secondary/60 px-3 py-2 rounded-full"
            >
              <ProhibitInset size={18} color={showBlocked ? "#00b7ff" : "#FFFFFF"} />
            </TouchableOpacity>
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
      ) : showBlocked ? (
        <View className="flex-1">
          <View className="px-4 py-2 bg-secondary/60 border-b border-accent/10">
            <Text className="text-text-secondary text-sm font-semibold">Заблокированные пользователи</Text>
          </View>
          {blockedUsers.length === 0 ? (
            <View className="flex-1 items-center justify-center px-6 mt-20">
              <ProhibitInset size={64} color="#6B7280" weight="thin" />
              <Text className="text-text-muted text-base mt-4 text-center">
                Нет заблокированных пользователей
              </Text>
            </View>
          ) : (
            <FlatList
              data={blockedUsers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="px-4 py-3 bg-secondary/40 border-b border-accent/10 flex-row items-center justify-between"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center flex-1">
                    <Avatar uri={item.user?.avatar} name={item.user?.name || item.user?.phone} size={48} />
                    <View className="ml-3 flex-1">
                      <Text className="text-text-primary font-semibold">{item.user?.name || "Без имени"}</Text>
                      <Text className="text-text-secondary text-sm">{item.user?.phone}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleUnblockUser(item.blockedUserId)}
                    className="bg-accent/20 border border-accent/50 px-4 py-2 rounded-full"
                  >
                    <Text className="text-accent font-semibold text-sm">Разблокировать</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      ) : (
        <View className="flex-1">
          {sections.length === 0 ? (
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
          ) : (
            <>
              <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={renderContactItem}
                renderSectionHeader={renderSectionHeader}
                stickySectionHeadersEnabled
              />
              {!searchQuery && renderAlphabetIndex()}
            </>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
