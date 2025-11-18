import { AnnaAvatar } from "@/components/AnnaAvatar";
import { FloatingParticles } from "@/components/FloatingParticles";
import { MessageBubble } from "@/components/MessageBubble";
import { NeonGlow } from "@/components/NeonGlow";
import { SpiderWebPattern } from "@/components/SpiderWebPattern";
import { Button } from "@/components/ui/Button";
import { streamAnnaResponse } from "@/lib/api/google-ai";
import { formatTime } from "@/lib/utils/format";
import { useAnnaStore, type AnnaMessage } from "@/stores/annaStore";
import { useAuthStore } from "@/stores/authStore";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ArrowClockwise, ArrowLeft, Copy, PaperPlaneTilt, VideoCamera } from "phosphor-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AnnaScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const {
    conversations,
    activeConversationId,
    mode,
    isGenerating,
    setMode,
    addMessage,
    setMessages,
    setActiveConversation,
    setIsGenerating,
  } = useAnnaStore();
  const [messageText, setMessageText] = useState("");
  const [currentResponse, setCurrentResponse] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const conversation = activeConversationId ? conversations[activeConversationId] || [] : [];

  useEffect(() => {
    if (!activeConversationId && user?.id) {
      const newId = `anna-${user.id}-${Date.now()}`;
      setActiveConversation(newId);
      setMessages(newId, []);
    }
  }, [user?.id, activeConversationId]);

  const handleSend = async () => {
    if (!messageText.trim() || !activeConversationId || !user?.id || isGenerating) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: AnnaMessage = {
      role: "user",
      content: messageText.trim(),
      timestamp: new Date(),
    };

    addMessage(activeConversationId, userMessage);
    setMessageText("");
    setIsGenerating(true);
    setCurrentResponse("");

    try {
      const allMessages: AnnaMessage[] = [...conversation, userMessage];
      const formattedMessages = allMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      let fullResponse = "";
      for await (const chunk of streamAnnaResponse({
        messages: formattedMessages,
        mode,
      })) {
        fullResponse += chunk;
        setCurrentResponse(fullResponse);
      }

      const modelMessage: AnnaMessage = {
        role: "model",
        content: fullResponse,
        timestamp: new Date(),
      };

      addMessage(activeConversationId, modelMessage);
      setCurrentResponse("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error getting Anna response:", error);
      const errorMessage = error instanceof Error ? error.message : "Произошла ошибка при получении ответа";
      Alert.alert("Ошибка", errorMessage, [{ text: "OK" }]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleRegenerate = async () => {
    if (conversation.length < 2 || !activeConversationId) return;
    const lastUserMessage = [...conversation].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      const newMessages = conversation.filter((m) => m !== lastUserMessage);
      setMessages(activeConversationId, newMessages);
      setMessageText(lastUserMessage.content);
    }
  };

  const displayMessages = currentResponse
    ? [...conversation, { role: "model" as const, content: currentResponse, timestamp: new Date() }]
    : conversation;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-primary"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <SpiderWebPattern opacity={0.1} color="#0099dd" animated />
      <FloatingParticles count={15} color="#00B7FF" opacity={0.3} />
      
      <View className="pt-12 pb-4 px-4 bg-secondary/40 border-b border-accent/10">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-text-primary text-lg font-bold">Shadow AI — Anna</Text>
            <View className="flex-row items-center mt-1">
              <AnnaAvatar isGenerating={isGenerating} size={32} />
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              router.push("/(main)/anna/video" as any);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            className="p-2"
          >
            <VideoCamera size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-2">
          <Button
            title="Normal"
            onPress={() => setMode("normal")}
            variant={mode === "normal" ? "primary" : "secondary"}
            size="sm"
            className="flex-1"
          />
          <Button
            title="Tech Mode"
            onPress={() => setMode("tech")}
            variant={mode === "tech" ? "primary" : "secondary"}
            size="sm"
            className="flex-1"
          />
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {displayMessages.length === 0 && (
          <View className="items-center justify-center py-16">
            <AnnaAvatar isGenerating={false} size={80} />
            <Text className="text-text-secondary text-base mt-4 text-center">
              Привет! Я Anna, твой AI-ассистент.{"\n"}Чем могу помочь?
            </Text>
          </View>
        )}

        {displayMessages.map((msg, index) => (
          <View key={index} className="mb-4">
            {msg.role === "user" ? (
              <MessageBubble text={msg.content} isOwn={true} time={formatTime(msg.timestamp)} />
            ) : (
              <View>
                <View className="flex-row items-center mb-2">
                  <AnnaAvatar isGenerating={index === displayMessages.length - 1 && isGenerating} size={32} />
                  <Text className="text-text-secondary text-sm ml-2">Anna</Text>
                </View>
                <MessageBubble text={msg.content} isOwn={false} />
                <View className="flex-row gap-2 mt-2 ml-12">
                  <TouchableOpacity
                    onPress={() => handleCopy(msg.content)}
                    className="flex-row items-center px-3 py-1.5 bg-secondary/60 rounded-lg"
                  >
                    <Copy size={14} color="#B0B8C0" />
                    <Text className="text-text-secondary text-xs ml-1">Copy</Text>
                  </TouchableOpacity>
                  {index === displayMessages.length - 1 && !isGenerating && (
                    <TouchableOpacity
                      onPress={handleRegenerate}
                      className="flex-row items-center px-3 py-1.5 bg-secondary/60 rounded-lg"
                    >
                      <ArrowClockwise size={14} color="#B0B8C0" />
                      <Text className="text-text-secondary text-xs ml-1">Regenerate</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View className="flex-row items-center px-4 py-3 bg-secondary/40 border-t border-accent/10">
        <TextInput
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Напишите Anna..."
          placeholderTextColor="#6B7280"
          className="flex-1 bg-secondary/60 border border-accent/20 rounded-xl px-4 py-3 text-text-primary text-base mr-2"
          multiline
          maxLength={4096}
          editable={!isGenerating}
        />
        <NeonGlow color="blue" intensity="medium" animated={messageText.trim() && !isGenerating}>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!messageText.trim() || isGenerating}
            className={`rounded-full p-3 ${messageText.trim() && !isGenerating ? "bg-accent" : "bg-secondary/60"}`}
            activeOpacity={0.8}
          >
            <PaperPlaneTilt
              size={20}
              color={messageText.trim() && !isGenerating ? "#FFFFFF" : "#6B7280"}
              weight="fill"
            />
          </TouchableOpacity>
        </NeonGlow>
      </View>
    </KeyboardAvoidingView>
  );
}

