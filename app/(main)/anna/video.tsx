// Anna Video Mode - AI Agent with Digital Human
// Real-time voice/video call with Anna using ZEGOCLOUD AI Agent

import { AnnaAIAgent } from "@/components/AnnaAIAgent";
import { MessageBubble } from "@/components/MessageBubble";
import { Button } from "@/components/ui/Button";
import { initializeAnnaAgent } from "@/lib/anna-agent-init";
import { getAnnaImageUrl } from "@/lib/utils/annaImage";
import { formatTime } from "@/lib/utils/format";
import { useAnnaStore } from "@/stores/annaStore";
import { useAuthStore } from "@/stores/authStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ArrowLeft, Microphone, PhoneSlash, VideoCamera, VideoCameraSlash } from "phosphor-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AnnaVideoScreen() {
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
  const [isVideoMode, setIsVideoMode] = useState(true);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [annaAgentId, setAnnaAgentId] = useState<string | null>(null);
  const [agentInstanceId, setAgentInstanceId] = useState<string | null>(null);
  const [isAgentReady, setIsAgentReady] = useState(false);
  const [agentStatus, setAgentStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [isInitializing, setIsInitializing] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const roomId = `anna_agent_${user?.id || "guest"}_${Date.now()}`;

  const conversation = activeConversationId ? conversations[activeConversationId] || [] : [];

  useEffect(() => {
    if (!activeConversationId && user?.id) {
      const newId = `anna-${user.id}-${Date.now()}`;
      setActiveConversation(newId);
      setMessages(newId, []);
    }
  }, [user?.id, activeConversationId]);

  // Initialize Anna Agent on mount
  useEffect(() => {
    if (!user?.id) return;

    const initAgent = async () => {
      try {
        setIsInitializing(true);
        // Get Anna.jpg URL
        const annaImageUrl = await getAnnaImageUrl();
        
        // Initialize Anna Agent (registers if needed)
        const agentId = await initializeAnnaAgent(annaImageUrl);
        setAnnaAgentId(agentId);
        
        setIsInitializing(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Error initializing Anna Agent:", error);
        setIsInitializing(false);
        Alert.alert(
          "Ошибка",
          "Не удалось инициализировать Anna AI Agent. Используйте текстовый режим.",
          [{ text: "OK" }]
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    };

    initAgent();
  }, [user?.id]);

  const handleAgentReady = (instanceId: string) => {
    setAgentInstanceId(instanceId);
    setIsAgentReady(true);
    setIsVoiceMode(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleAgentError = (error: Error) => {
    console.error("AI Agent error:", error);
    Alert.alert(
      "Ошибка",
      "Не удалось подключиться к Anna AI Agent. Переключение в текстовый режим.",
      [{ text: "OK" }]
    );
    setIsVideoMode(false);
    setIsVoiceMode(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const handleStatusChange = (status: "idle" | "listening" | "thinking" | "speaking") => {
    setAgentStatus(status);
  };

  const handleSend = async () => {
    // In voice mode, user speaks directly - no need to send text
    if (isVoiceMode && isAgentReady) {
      Alert.alert("Голосовой режим", "Просто говорите - Anna услышит вас!");
      return;
    }

    // Text mode fallback
    if (!messageText.trim() || !activeConversationId || !user?.id || isGenerating) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Текстовый режим", "В голосовом режиме просто говорите. Переключитесь в текстовый режим для отправки сообщений.");
  };

  const displayMessages = conversation;

  if (!user?.id) {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <Text className="text-text-secondary">Требуется авторизация</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-primary"
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* AI Agent Video/Voice View */}
      {isVideoMode && annaAgentId && user?.id && (
        <View className="absolute inset-0">
          <AnnaAIAgent
            roomId={roomId}
            userId={user.id}
            agentId={annaAgentId}
            callType={isVideoMode ? "digital_human_video" : "voice"}
            onReady={handleAgentReady}
            onError={handleAgentError}
            onStatusChange={handleStatusChange}
          />
        </View>
      )}

      {isInitializing && (
        <View className="absolute inset-0 items-center justify-center bg-black/80">
          <Text className="text-text-primary text-lg mb-2">Инициализация Anna AI Agent...</Text>
          <Text className="text-text-secondary text-sm">Пожалуйста, подождите</Text>
        </View>
      )}

      {/* Overlay UI */}
      <View className="flex-1">
        {/* Header */}
        <View className="pt-12 pb-4 px-4 bg-black/60 border-b border-accent/10">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <Text className="text-text-primary text-lg font-bold">Shadow AI — Anna</Text>
              <View className="flex-row items-center mt-1">
                {agentStatus !== "idle" && (
                  <View className={`w-2 h-2 rounded-full mr-2 ${
                    agentStatus === "speaking" ? "bg-accent animate-pulse" :
                    agentStatus === "listening" ? "bg-green-500" :
                    agentStatus === "thinking" ? "bg-yellow-500" :
                    "bg-gray-500"
                  }`} />
                )}
                <Text className="text-text-secondary text-xs">
                  {isInitializing ? "Инициализация..." :
                   isAgentReady ? (isVideoMode ? "Видео режим" : "Голосовой режим") :
                   "Подключение..."}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => {
                  setIsVideoMode(!isVideoMode);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className="ml-2 p-2"
              >
                {isVideoMode ? (
                  <VideoCameraSlash size={24} color="#FFFFFF" />
                ) : (
                  <VideoCamera size={24} color="#FFFFFF" />
                )}
              </TouchableOpacity>
              {isVoiceMode && (
                <TouchableOpacity
                  onPress={() => {
                    setIsVoiceMode(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className="ml-2 p-2"
                >
                  <PhoneSlash size={24} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
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

        {/* Messages (semi-transparent overlay) */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          style={{ backgroundColor: isVideoMode ? "rgba(9, 13, 18, 0.7)" : "transparent" }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
        {displayMessages.length === 0 && (
          <View className="items-center justify-center py-16">
            <Text className="text-text-secondary text-base mt-4 text-center px-4">
              {isVoiceMode && isAgentReady
                ? "Привет! Я Anna, твой AI-ассистент.\nПросто говори - я услышу тебя и отвечу в реальном времени!"
                : isVideoMode
                ? "Привет! Я Anna, твой AI-ассистент.\nГовори со мной, и я отвечу!"
                : "Привет! Я Anna, твой AI-ассистент.\nЧем могу помочь?"}
            </Text>
            {isVoiceMode && isAgentReady && (
              <View className="mt-4 items-center">
                <View className="w-16 h-16 rounded-full border-2 border-accent items-center justify-center">
                  <Microphone size={32} color="#00B7FF" weight="fill" />
                </View>
                <Text className="text-text-secondary text-xs mt-2">
                  {agentStatus === "listening" ? "Слушаю..." :
                   agentStatus === "speaking" ? "Говорю..." :
                   agentStatus === "thinking" ? "Думаю..." :
                   "Готов к разговору"}
                </Text>
              </View>
            )}
          </View>
        )}

          {displayMessages.map((msg, index) => (
            <View key={index} className="mb-4">
              {msg.role === "user" ? (
                <MessageBubble text={msg.content} isOwn={true} time={formatTime(msg.timestamp)} />
              ) : (
                <View>
                  <Text className="text-text-secondary text-sm mb-2">Anna</Text>
                  <MessageBubble text={msg.content} isOwn={false} />
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Input - Only show in text mode or when voice is disabled */}
        {(!isVoiceMode || !isAgentReady) && (
          <View className="flex-row items-center px-4 py-3 bg-black/60 border-t border-accent/10">
            <TextInput
              value={messageText}
              onChangeText={setMessageText}
              placeholder={isVoiceMode ? "Голосовой режим активен" : "Напишите Anna..."}
              placeholderTextColor="#6B7280"
              className="flex-1 bg-secondary/60 border border-accent/20 rounded-xl px-4 py-3 text-text-primary text-base mr-2"
              multiline
              maxLength={4096}
              editable={!isVoiceMode && !isGenerating}
            />
            {!isVoiceMode && (
              <TouchableOpacity
                onPress={handleSend}
                disabled={!messageText.trim() || isGenerating}
                className={`rounded-full p-3 ${messageText.trim() && !isGenerating ? "bg-accent" : "bg-secondary/60"}`}
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold">{isGenerating ? "..." : "→"}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Voice Mode Indicator */}
        {isVoiceMode && isAgentReady && (
          <View className="px-4 py-3 bg-black/60 border-t border-accent/10 items-center">
            <View className="flex-row items-center">
              <View className={`w-3 h-3 rounded-full mr-2 ${
                agentStatus === "listening" ? "bg-green-500 animate-pulse" :
                agentStatus === "speaking" ? "bg-accent" :
                "bg-gray-500"
              }`} />
              <Text className="text-text-secondary text-sm">
                {agentStatus === "listening" ? "Слушаю вас..." :
                 agentStatus === "speaking" ? "Anna говорит..." :
                 agentStatus === "thinking" ? "Anna думает..." :
                 "Готов к разговору - просто говорите"}
              </Text>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

