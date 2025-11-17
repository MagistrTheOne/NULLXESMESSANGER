import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, PaperPlaneTilt, Microphone, Image as ImageIcon } from "phosphor-react-native";
import { MessageBubble } from "@/components/MessageBubble";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { useMessageStore } from "@/stores/messageStore";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { getChatMessages, createMessage } from "@/lib/api/db";
import { formatTime } from "@/lib/utils/format";
import { showImagePickerOptions } from "@/lib/utils/imagePicker";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [messageText, setMessageText] = useState("");
  const user = useAuthStore((state) => state.user);
  const messages = useMessageStore((state) => state.messages[id || ""] || []);
  const setMessages = useMessageStore((state) => state.setMessages);
  const chat = useChatStore((state) => state.chats.find((c) => c.id === id));

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
    } catch (error) {
      console.error("Error sending message:", error);
    }
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
          />
        )}
        contentContainerStyle={{ paddingVertical: 16 }}
        inverted
      />

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
        {messageText.trim() ? (
          <TouchableOpacity
            onPress={handleSend}
            className="bg-accent rounded-full p-3"
            activeOpacity={0.8}
          >
            <PaperPlaneTilt size={20} color="#FFFFFF" weight="fill" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-secondary/60 rounded-full p-3"
            activeOpacity={0.8}
          >
            <Microphone size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

