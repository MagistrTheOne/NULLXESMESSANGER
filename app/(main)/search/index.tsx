import { SearchMessageItem } from "@/components/SearchMessageItem";
import { Avatar } from "@/components/ui/Avatar";
import { addSearchHistory, deleteSearchHistory, getSearchHistory, searchContacts, searchMedia, searchMessages } from "@/lib/api/db";
import { formatTime } from "@/lib/utils/format";
import { useAuthStore } from "@/stores/authStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, ChatText, Clock, File, Image as ImageIcon, MagnifyingGlass, Trash, User, Video, X } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, SectionList, Text, TextInput, TouchableOpacity, View } from "react-native";

type SearchTab = "all" | "messages" | "contacts" | "media";

export default function GlobalSearchScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterChatId, setFilterChatId] = useState<string | undefined>(undefined);
  const [filterSenderId, setFilterSenderId] = useState<string | undefined>(undefined);
  const [filterType, setFilterType] = useState<"text" | "image" | "voice" | "video" | "file" | undefined>(undefined);
  const [filterDateFrom, setFilterDateFrom] = useState<Date | undefined>(undefined);
  const [filterDateTo, setFilterDateTo] = useState<Date | undefined>(undefined);

  // Results
  const [messages, setMessages] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadHistory();
    }
  }, [user?.id]);

  useEffect(() => {
    if (searchQuery.trim() && user?.id) {
      performSearch();
    } else {
      setMessages([]);
      setContacts([]);
      setMedia([]);
    }
  }, [searchQuery, activeTab, filterChatId, filterSenderId, filterType, filterDateFrom, filterDateTo]);

  const loadHistory = async () => {
    if (!user?.id) return;
    try {
      const searchHistory = await getSearchHistory(user.id, 10);
      setHistory(searchHistory);
    } catch (error) {
      console.error("Error loading search history:", error);
    }
  };

  const performSearch = async () => {
    if (!user?.id || !searchQuery.trim()) return;
    
    setLoading(true);
    try {
      // Save to history
      await addSearchHistory(user.id, searchQuery, activeTab);
      await loadHistory();

      if (activeTab === "all" || activeTab === "messages") {
        const messageResults = await searchMessages(user.id, searchQuery, {
          chatId: filterChatId,
          senderId: filterSenderId,
          messageType: filterType,
          dateFrom: filterDateFrom,
          dateTo: filterDateTo,
        });
        setMessages(messageResults);
      }

      if (activeTab === "all" || activeTab === "contacts") {
        const contactResults = await searchContacts(user.id, searchQuery);
        setContacts(contactResults);
      }

      if (activeTab === "all" || activeTab === "media") {
        const mediaResults = await searchMedia(user.id, searchQuery, {
          chatId: filterChatId,
          mediaType: filterType as "image" | "video" | "file" | undefined,
          dateFrom: filterDateFrom,
          dateTo: filterDateTo,
        });
        setMedia(mediaResults);
      }
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryItemPress = async (historyItem: any) => {
    setSearchQuery(historyItem.query);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDeleteHistoryItem = async (historyId: string) => {
    if (!user?.id) return;
    try {
      await deleteSearchHistory(user.id, historyId);
      await loadHistory();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Error deleting history item:", error);
    }
  };

  const handleClearHistory = async () => {
    if (!user?.id) return;
    try {
      await deleteSearchHistory(user.id);
      setHistory([]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi"));
    return (
      <Text>
        {parts.map((part, index) => (
          <Text
            key={index}
            className={part.toLowerCase() === query.toLowerCase() ? "bg-accent/50 font-semibold" : ""}
          >
            {part}
          </Text>
        ))}
      </Text>
    );
  };

  const renderMessageItem = ({ item }: { item: any }) => (
    <SearchMessageItem item={item} searchQuery={searchQuery} />
  );

  const renderContactItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => {
        // Navigate to contact or create chat
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      className="bg-secondary/40 border border-accent/10 rounded-xl p-4 mb-2 mx-4 flex-row items-center"
      activeOpacity={0.8}
    >
      <Avatar uri={item.avatar} name={item.name} size={48} />
      <View className="ml-4 flex-1">
        <Text className="text-text-primary text-base font-semibold">
          {highlightText(item.name || item.phone || "Контакт", searchQuery)}
        </Text>
        {item.phone && (
          <Text className="text-text-secondary text-sm mt-1">
            {highlightText(item.phone, searchQuery)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderMediaItem = ({ item }: { item: any }) => {
    const isImage = item.type === "image";
    const isVideo = item.type === "video";
    const isFile = item.type === "file";

    return (
      <TouchableOpacity
        onPress={() => {
          if (isFile) {
            router.push(`/(main)/chat/${item.chatId}/document?messageId=${item.id}` as any);
          } else {
            router.push(`/(main)/chat/${item.chatId}/media` as any);
          }
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        className="bg-secondary/40 border border-accent/10 rounded-xl p-4 mb-2 mx-4 flex-row items-center"
        activeOpacity={0.8}
      >
        {isImage && <ImageIcon size={32} color="#00b7ff" weight="fill" />}
        {isVideo && <Video size={32} color="#00b7ff" weight="fill" />}
        {isFile && <File size={32} color="#00b7ff" weight="fill" />}
        <View className="ml-4 flex-1">
          <Text className="text-text-primary text-base font-semibold" numberOfLines={1}>
            {isFile ? item.content.split("/").pop() : `${item.type === "image" ? "Фото" : "Видео"}`}
          </Text>
          <Text className="text-text-secondary text-xs mt-1">
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderAllResults = () => {
    const sections = [];

    if (messages.length > 0) {
      sections.push({
        title: `Сообщения (${messages.length})`,
        data: messages,
        renderItem: renderMessageItem,
      });
    }

    if (contacts.length > 0) {
      sections.push({
        title: `Контакты (${contacts.length})`,
        data: contacts,
        renderItem: renderContactItem,
      });
    }

    if (media.length > 0) {
      sections.push({
        title: `Медиа (${media.length})`,
        data: media,
        renderItem: renderMediaItem,
      });
    }

    if (sections.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <MagnifyingGlass size={64} color="#6B7280" weight="thin" />
          <Text className="text-text-muted text-base mt-4 text-center">
            {searchQuery ? "Ничего не найдено" : "Начните вводить для поиска"}
          </Text>
        </View>
      );
    }

    return (
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => `${item.id || index}-${index}`}
        renderItem={({ item, section }) => section.renderItem({ item })}
        renderSectionHeader={({ section }) => (
          <View className="bg-primary px-4 py-2">
            <Text className="text-text-secondary text-sm font-semibold">
              {section.title}
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    );
  };

  const renderTabResults = () => {
    if (activeTab === "messages") {
      if (messages.length === 0) {
        return (
          <View className="flex-1 items-center justify-center px-6">
            <ChatText size={64} color="#6B7280" weight="thin" />
            <Text className="text-text-muted text-base mt-4 text-center">
              Сообщения не найдены
            </Text>
          </View>
        );
      }
      return (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      );
    }

    if (activeTab === "contacts") {
      if (contacts.length === 0) {
        return (
          <View className="flex-1 items-center justify-center px-6">
            <User size={64} color="#6B7280" weight="thin" />
            <Text className="text-text-muted text-base mt-4 text-center">
              Контакты не найдены
            </Text>
          </View>
        );
      }
      return (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContactItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      );
    }

    if (activeTab === "media") {
      if (media.length === 0) {
        return (
          <View className="flex-1 items-center justify-center px-6">
            <ImageIcon size={64} color="#6B7280" weight="thin" />
            <Text className="text-text-muted text-base mt-4 text-center">
              Медиа не найдено
            </Text>
          </View>
        );
      }
      return (
        <FlatList
          data={media}
          keyExtractor={(item) => item.id}
          renderItem={renderMediaItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      );
    }

    return renderAllResults();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-primary"
    >
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View className="flex-1 flex-row items-center bg-secondary/60 rounded-xl px-4 py-2">
            <MagnifyingGlass size={20} color="#6B7280" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Поиск по всем сообщениям, контактам, медиа..."
              placeholderTextColor="#6B7280"
              className="flex-1 ml-2 text-text-primary text-base"
              autoFocus
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
          <TouchableOpacity
            onPress={() => {
              setShowFilters(!showFilters);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            className="ml-2 p-2"
          >
            <Calendar size={20} color={showFilters ? "#00b7ff" : "#FFFFFF"} />
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-2">
          {(["all", "messages", "contacts", "media"] as SearchTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => {
                setActiveTab(tab);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className={`px-4 py-2 rounded-lg ${
                activeTab === tab
                  ? "bg-accent"
                  : "bg-secondary/60 border border-accent/10"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  activeTab === tab ? "text-white" : "text-text-secondary"
                }`}
              >
                {tab === "all" && "Все"}
                {tab === "messages" && "Сообщения"}
                {tab === "contacts" && "Контакты"}
                {tab === "media" && "Медиа"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {showFilters && (
          <View className="mt-4 bg-secondary/60 rounded-xl p-4 border border-accent/10">
            <Text className="text-text-primary font-semibold mb-3">Фильтры</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => {
                    setFilterType(filterType === "text" ? undefined : "text");
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={`px-3 py-2 rounded-lg ${
                    filterType === "text" ? "bg-accent" : "bg-secondary/40"
                  }`}
                >
                  <Text className={`text-xs ${filterType === "text" ? "text-white" : "text-text-secondary"}`}>
                    Текст
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setFilterType(filterType === "image" ? undefined : "image");
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={`px-3 py-2 rounded-lg ${
                    filterType === "image" ? "bg-accent" : "bg-secondary/40"
                  }`}
                >
                  <Text className={`text-xs ${filterType === "image" ? "text-white" : "text-text-secondary"}`}>
                    Фото
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setFilterType(filterType === "video" ? undefined : "video");
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={`px-3 py-2 rounded-lg ${
                    filterType === "video" ? "bg-accent" : "bg-secondary/40"
                  }`}
                >
                  <Text className={`text-xs ${filterType === "video" ? "text-white" : "text-text-secondary"}`}>
                    Видео
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setFilterType(filterType === "file" ? undefined : "file");
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={`px-3 py-2 rounded-lg ${
                    filterType === "file" ? "bg-accent" : "bg-secondary/40"
                  }`}
                >
                  <Text className={`text-xs ${filterType === "file" ? "text-white" : "text-text-secondary"}`}>
                    Файлы
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    // Reset all filters
                    setFilterChatId(undefined);
                    setFilterSenderId(undefined);
                    setFilterType(undefined);
                    setFilterDateFrom(undefined);
                    setFilterDateTo(undefined);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className="px-3 py-2 rounded-lg bg-secondary/40"
                >
                  <Text className="text-xs text-text-secondary">Сбросить</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-text-secondary">Поиск...</Text>
        </View>
      ) : searchQuery.trim() ? (
        renderTabResults()
      ) : (
        <View className="flex-1">
          {history.length > 0 && (
            <View className="px-4 py-2 flex-row items-center justify-between">
              <Text className="text-text-secondary text-sm font-semibold">Недавние поиски</Text>
              <TouchableOpacity onPress={handleClearHistory}>
                <Text className="text-accent text-sm">Очистить</Text>
              </TouchableOpacity>
            </View>
          )}
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleHistoryItemPress(item)}
                className="flex-row items-center justify-between px-4 py-3 bg-secondary/40 border-b border-accent/10"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center flex-1">
                  <Clock size={20} color="#6B7280" />
                  <Text className="text-text-primary text-base ml-3 flex-1">{item.query}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteHistoryItem(item.id)}
                  className="ml-2 p-2"
                >
                  <Trash size={16} color="#6B7280" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center px-6 py-12">
                <MagnifyingGlass size={64} color="#6B7280" weight="thin" />
                <Text className="text-text-muted text-base mt-4 text-center">
                  Начните вводить для поиска
                </Text>
              </View>
            }
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

