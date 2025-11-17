import { MessageBubble } from "@/components/MessageBubble";
import { NeonGlow } from "@/components/NeonGlow";
import { createMessage, getChatMessages, updateMessage, deleteMessage, forwardMessage, getUserChats } from "@/lib/api/db";
import { formatTime } from "@/lib/utils/format";
import { showImagePickerOptions } from "@/lib/utils/imagePicker";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useMessageStore } from "@/stores/messageStore";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, CaretDown, Image as ImageIcon, Microphone, PaperPlaneTilt, X } from "phosphor-react-native";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View, Alert, Modal } from "react-native";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [messageText, setMessageText] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [forwardingMessageId, setForwardingMessageId] = useState<string | null>(null);
  const [availableChats, setAvailableChats] = useState<any[]>([]);
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
          isRead: msg.isRead,
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
      const newMessage = await createMessage(id, user.id, messageText.trim());
      setMessages(id, [
        ...messages,
        {
          id: newMessage.id,
          chatId: newMessage.chatId,
          userId: newMessage.userId,
          content: newMessage.content,
          type: newMessage.type as "text",
          isRead: newMessage.isRead,
          createdAt: newMessage.createdAt,
        },
      ]);
      setMessageText("");
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
      const newMessage = await createMessage(id, user.id, imageUri, "image");
      setMessages(id, [
        ...messages,
        {
          id: newMessage.id,
          chatId: newMessage.chatId,
          userId: newMessage.userId,
          content: newMessage.content,
          type: newMessage.type as "image",
          isRead: newMessage.isRead,
          createdAt: newMessage.createdAt,
        },
      ]);
    } catch (error) {
      console.error("Error sending image:", error);
    }
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      const uri = await stopRecording();
      if (uri && id && user?.id) {
        try {
          const newMessage = await createMessage(id, user.id, uri, "voice");
          setMessages(id, [
            ...messages,
            {
              id: newMessage.id,
              chatId: newMessage.chatId,
              userId: newMessage.userId,
              content: newMessage.content,
              type: newMessage.type as "voice",
              isRead: newMessage.isRead,
              createdAt: newMessage.createdAt,
            },
          ]);
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-primary"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-text-primary text-lg font-semibold flex-1">
          {chat?.name || "Чат"}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={[...messages].reverse()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            text={item.type === "image" ? "" : item.content}
            isOwn={item.userId === user?.id}
            time={formatTime(item.createdAt)}
            isRead={item.isRead}
            imageUri={item.type === "image" ? item.content : undefined}
            type={item.type}
            messageId={item.id}
            chatId={id}
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
            onForward={handleForwardMessage}
          />
        )}
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
      </View>
    </KeyboardAvoidingView>
  );
}

