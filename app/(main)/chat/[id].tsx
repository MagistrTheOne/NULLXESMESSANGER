import { DateHeader } from "@/components/DateHeader";
import { MessageBubble } from "@/components/MessageBubble";
import { NeonGlow } from "@/components/NeonGlow";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { createCall, createMessage, deleteMessage, forwardMessage, getChatMessages, getUserById, getUserChats, updateMessage } from "@/lib/api/db";
import { formatTime, isSameDay } from "@/lib/utils/format";
import { showImagePickerOptions } from "@/lib/utils/imagePicker";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useMessageStore } from "@/stores/messageStore";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, CaretDown, CaretUp, Image as ImageIcon, Images, MagnifyingGlass, Microphone, PaperPlaneTilt, Phone, VideoCamera, X } from "phosphor-react-native";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [messageText, setMessageText] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [forwardingMessageId, setForwardingMessageId] = useState<string | null>(null);
  const [replyingToMessageId, setReplyingToMessageId] = useState<string | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<any | null>(null);
  const [availableChats, setAvailableChats] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const flatListRef = useRef<FlatList>(null);
  const user = useAuthStore((state) => state.user);
  const messages = useMessageStore((state) => state.messages[id || ""] || []);
  const setMessages = useMessageStore((state) => state.setMessages);
  const updateMessageInStore = useMessageStore((state) => state.updateMessage);
  const chat = useChatStore((state) => state.chats.find((c) => c.id === id));
  const { isRecording, duration, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();

  useEffect(() => {
    if (id) {
      loadMessages();
    }
  }, [id]);

  const loadMessages = async () => {
    if (!id) return;
    try {
      const chatMessages = await getChatMessages(id);
      setMessages(
        id,
        chatMessages.map((msg) => ({
          id: msg.id,
          chatId: msg.chatId,
          userId: msg.userId,
          content: msg.content,
          type: msg.type as "text" | "image" | "voice" | "video" | "file",
          replyToId: msg.replyToId || null,
          isRead: msg.isRead ?? false,
          createdAt: msg.createdAt,
        }))
      );
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSend = async () => {
    if (!messageText.trim() || !id || !user?.id) return;

    if (editingMessageId) {
      await handleSaveEdit();
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const newMessage = await createMessage(id, user.id, messageText.trim(), "text", replyingToMessageId);
      setMessages(id, [
        ...messages,
        {
          id: newMessage.id,
          chatId: newMessage.chatId,
          userId: newMessage.userId,
          content: newMessage.content,
          type: newMessage.type as "text",
          replyToId: newMessage.replyToId || null,
          isRead: newMessage.isRead ?? false,
          createdAt: newMessage.createdAt,
        },
      ]);
      setMessageText("");
      setReplyingToMessageId(null);
      setReplyingToMessage(null);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: 0, animated: true });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleScrollToBottom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    flatListRef.current?.scrollToIndex({ index: 0, animated: true });
    setShowScrollButton(false);
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollButton(offsetY > 200);
  };

  const handlePickImage = async () => {
    if (!id || !user?.id) return;
    
    const imageUri = await showImagePickerOptions();
    if (!imageUri) return;

    try {
      const newMessage = await createMessage(id, user.id, imageUri, "image", replyingToMessageId);
      setMessages(id, [
        ...messages,
        {
          id: newMessage.id,
          chatId: newMessage.chatId,
          userId: newMessage.userId,
          content: newMessage.content,
          type: newMessage.type as "image",
          replyToId: newMessage.replyToId || null,
          isRead: newMessage.isRead ?? false,
          createdAt: newMessage.createdAt,
        },
      ]);
      setReplyingToMessageId(null);
      setReplyingToMessage(null);
    } catch (error) {
      console.error("Error sending image:", error);
    }
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      const uri = await stopRecording();
      if (uri && id && user?.id) {
        try {
          const newMessage = await createMessage(id, user.id, uri, "voice", replyingToMessageId);
          setMessages(id, [
            ...messages,
            {
              id: newMessage.id,
              chatId: newMessage.chatId,
              userId: newMessage.userId,
              content: newMessage.content,
              type: newMessage.type as "voice",
              replyToId: newMessage.replyToId || null,
              isRead: newMessage.isRead ?? false,
              createdAt: newMessage.createdAt,
            },
          ]);
          setReplyingToMessageId(null);
          setReplyingToMessage(null);
        } catch (error) {
          console.error("Error sending voice:", error);
        }
      }
    } else {
      await startRecording();
    }
  };

  const handleEditMessage = async (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      setEditingMessageId(messageId);
      setMessageText(message.content);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !messageText.trim()) return;
    try {
      await updateMessage(editingMessageId, messageText.trim());
      updateMessageInStore(id!, editingMessageId, { content: messageText.trim() });
      setEditingMessageId(null);
      setMessageText("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error updating message:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDeleteMessage = async (messageId: string, deleteForEveryone: boolean) => {
    try {
      await deleteMessage(messageId, deleteForEveryone);
      if (deleteForEveryone) {
        setMessages(
          id!,
          messages.filter((m) => m.id !== messageId)
        );
      } else {
        updateMessageInStore(id!, messageId, { content: "Сообщение удалено" });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error deleting message:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleCall = async (type: "voice" | "video") => {
    if (!id || !user?.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await createCall(user.id, id, null, type, "outgoing");
      
      // Navigate to video call screen
      const roomId = `room_${id}_${Date.now()}`;
      router.push({
        pathname: "/(main)/call/video",
        params: {
          roomId,
          userId: user.id,
          userName: user.name || user.phone,
          isVideo: type === "video" ? "true" : "false",
        },
      } as any);
    } catch (error) {
      console.error("Error creating call:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleReplyMessage = async (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    try {
      // Get user info for reply preview
      const messageUser = await getUserById(message.userId);
      setReplyingToMessage({
        id: message.id,
        content: message.content,
        type: message.type,
        userId: message.userId,
        userName: messageUser?.name || messageUser?.phone,
      });
      setReplyingToMessageId(messageId);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Error loading reply message:", error);
    }
  };

  const handleForwardMessage = async (messageId: string) => {
    if (!user?.id) return;
    setForwardingMessageId(messageId);
    try {
      const chats = await getUserChats(user.id);
      setAvailableChats(chats.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  };

  const handleForwardToChat = async (targetChatId: string) => {
    if (!forwardingMessageId || !user?.id) return;
    try {
      await forwardMessage(forwardingMessageId, [targetChatId], user.id);
      setForwardingMessageId(null);
      setAvailableChats([]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error forwarding message:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    const queryLower = query.toLowerCase();
    const results = messages.filter((msg) => {
      if (msg.type === "text" || msg.type === "file") {
        return msg.content.toLowerCase().includes(queryLower);
      }
      return false;
    });

    setSearchResults(results);
    if (results.length > 0) {
      setCurrentSearchIndex(0);
      scrollToMessage(results[0].id);
    } else {
      setCurrentSearchIndex(-1);
    }
  };

  const navigateSearch = (direction: number) => {
    if (searchResults.length === 0) return;

    const newIndex = currentSearchIndex + direction;
    if (newIndex >= 0 && newIndex < searchResults.length) {
      setCurrentSearchIndex(newIndex);
      scrollToMessage(searchResults[newIndex].id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const scrollToMessage = (messageId: string) => {
    const dataToSearch = isSearchMode && searchQuery.trim() ? searchResults : messages;
    const reversedData = [...dataToSearch].reverse();
    const index = reversedData.findIndex((msg) => msg.id === messageId);
    if (index !== -1 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }, 100);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-primary"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10">
        {isSearchMode ? (
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => {
                setIsSearchMode(false);
                setSearchQuery("");
                setSearchResults([]);
                setCurrentSearchIndex(-1);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="mr-4"
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View className="flex-1 flex-row items-center bg-secondary/60 rounded-xl px-4 py-2 mr-2">
              <MagnifyingGlass size={20} color="#6B7280" />
              <TextInput
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  performSearch(text);
                }}
                placeholder="Поиск в чате..."
                placeholderTextColor="#6B7280"
                className="flex-1 ml-2 text-text-primary text-base"
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setCurrentSearchIndex(-1);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <X size={20} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
            {searchResults.length > 0 && (
              <View className="flex-row items-center">
                <Text className="text-text-secondary text-sm mr-2">
                  {currentSearchIndex + 1}/{searchResults.length}
                </Text>
                <TouchableOpacity
                  onPress={() => navigateSearch(-1)}
                  className="p-2"
                  disabled={currentSearchIndex <= 0}
                >
                  <CaretUp size={20} color={currentSearchIndex <= 0 ? "#6B7280" : "#FFFFFF"} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigateSearch(1)}
                  className="p-2"
                  disabled={currentSearchIndex >= searchResults.length - 1}
                >
                  <CaretDown size={20} color={currentSearchIndex >= searchResults.length - 1 ? "#6B7280" : "#FFFFFF"} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-text-primary text-lg font-semibold flex-1">
              {chat?.name || "Чат"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setIsSearchMode(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="ml-2 p-2"
            >
              <MagnifyingGlass size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                router.push(`/(main)/chat/${id}/media` as any);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="ml-2 p-2"
            >
              <Images size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleCall("voice")}
              className="ml-2 p-2"
            >
              <Phone size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleCall("video")}
              className="ml-2 p-2"
            >
              <VideoCamera size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={isSearchMode && searchQuery.trim() ? [...searchResults].reverse() : [...messages].reverse()}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item, index }) => {
          // Find reply message if exists
          const replyMessage = item.replyToId 
            ? messages.find((m) => m.id === item.replyToId)
            : null;
          
          const replyToMessage = replyMessage ? {
            id: replyMessage.id,
            content: replyMessage.content,
            type: replyMessage.type,
            userId: replyMessage.userId,
            userName: replyMessage.userId === user?.id ? "Вы" : undefined,
          } : null;

          // Check if we need to show date header
          const currentData = isSearchMode && searchQuery.trim() ? [...searchResults].reverse() : [...messages].reverse();
          const showDateHeader = 
            index === 0 || 
            !isSameDay(item.createdAt, currentData[index - 1]?.createdAt);

          // Check if message is current search result
          const isCurrentSearchResult = currentSearchIndex >= 0 && searchResults[currentSearchIndex]?.id === item.id;

          return (
            <>
              {showDateHeader && <DateHeader date={item.createdAt} />}
              <View className={isCurrentSearchResult ? "bg-accent/20 rounded-xl p-1" : ""}>
                <MessageBubble
                  text={item.type === "image" ? "" : item.content}
                  isOwn={item.userId === user?.id}
                  time={formatTime(item.createdAt)}
                  isRead={item.isRead}
                  imageUri={item.type === "image" ? item.content : undefined}
                  type={item.type}
                  messageId={item.id}
                  chatId={id}
                  replyToId={item.replyToId || null}
                  replyToMessage={replyToMessage}
                  searchQuery={isSearchMode && searchQuery.trim() ? searchQuery : undefined}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                  onForward={handleForwardMessage}
                  onReply={handleReplyMessage}
                />
              </View>
            </>
          );
        }}
        contentContainerStyle={{ paddingVertical: 16 }}
        inverted
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {showScrollButton && (
        <View className="absolute bottom-24 right-6">
          <NeonGlow color="blue" intensity="medium" animated>
            <TouchableOpacity
              onPress={handleScrollToBottom}
              className="bg-accent rounded-full p-3"
              activeOpacity={0.8}
            >
              <CaretDown size={24} color="#FFFFFF" weight="fill" />
            </TouchableOpacity>
          </NeonGlow>
        </View>
      )}

      <View className="flex-row items-center px-4 py-3 bg-secondary/40 border-t border-accent/10">
        <TouchableOpacity
          onPress={handlePickImage}
          className="bg-secondary/60 rounded-full p-3 mr-2"
          activeOpacity={0.8}
        >
          <ImageIcon size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TextInput
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Сообщение..."
          placeholderTextColor="#6B7280"
          className="flex-1 bg-secondary/60 border border-accent/20 rounded-xl px-4 py-3 text-text-primary text-base mr-2"
          multiline
          maxLength={4096}
        />
        {messageText.trim() || editingMessageId ? (
          <TouchableOpacity
            onPress={handleSend}
            className="bg-accent rounded-full p-3"
            activeOpacity={0.8}
          >
            <PaperPlaneTilt size={20} color="#FFFFFF" weight="fill" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleVoiceRecord}
            onLongPress={startRecording}
            className={`rounded-full p-3 ${isRecording ? "bg-danger" : "bg-secondary/60"}`}
            activeOpacity={0.8}
          >
            {isRecording ? (
              <View className="items-center">
                <TouchableOpacity onPress={cancelRecording}>
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text className="text-white text-xs mt-1">{duration}s</Text>
              </View>
            ) : (
              <Microphone size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {editingMessageId && (
        <View className="bg-accent/20 px-4 py-2 flex-row items-center justify-between">
          <Text className="text-accent text-sm">Редактирование сообщения</Text>
          <TouchableOpacity onPress={() => { setEditingMessageId(null); setMessageText(""); }}>
            <X size={20} color="#00B7FF" />
          </TouchableOpacity>
        </View>
      )}

      {replyingToMessage && (
        <View className="bg-secondary/60 px-4 py-2 border-t border-accent/10 flex-row items-center justify-between">
          <View className="flex-1 mr-2">
            <View className="flex-row items-center mb-1">
              <View className="w-0.5 h-4 bg-accent mr-2" />
              <Text className="text-accent text-xs font-semibold">
                {replyingToMessage.userId === user?.id ? "Вы" : replyingToMessage.userName || "Пользователь"}
              </Text>
            </View>
            <Text className="text-text-secondary text-xs" numberOfLines={1}>
              {replyingToMessage.type === "image" 
                ? "📷 Фото" 
                : replyingToMessage.type === "voice" 
                ? "🎤 Голосовое сообщение"
                : replyingToMessage.content}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => { 
              setReplyingToMessageId(null); 
              setReplyingToMessage(null); 
            }}
          >
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {forwardingMessageId && (
        <Modal visible={true} transparent animationType="slide">
          <View className="flex-1 bg-black/50 items-center justify-end">
            <View className="w-full bg-secondary border-t border-accent/20 rounded-t-3xl p-4" style={{ maxHeight: "70%" }}>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-text-primary text-lg font-semibold">Переслать в</Text>
                <TouchableOpacity onPress={() => { setForwardingMessageId(null); setAvailableChats([]); }}>
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={availableChats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleForwardToChat(item.id)}
                    className="flex-row items-center p-3 bg-secondary/60 rounded-xl mb-2"
                  >
                    <Text className="text-text-primary flex-1">{item.name || "Чат"}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

