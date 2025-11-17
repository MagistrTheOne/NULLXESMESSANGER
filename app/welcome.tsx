import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useEffect } from "react";
import { Animated, Text, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Анимация появления
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Редирект на авторизацию через 2 секунды
    const timer = setTimeout(async () => {
      try {
        // Mark welcome as seen
        const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
        await AsyncStorage.setItem("hasSeenWelcome", "true");
        
        // Navigate to auth
        router.replace("/(auth)/phone");
      } catch (error) {
        console.error("Error saving welcome state:", error);
        router.replace("/(auth)/phone");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-primary items-center justify-center">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center"
      >
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
        >
          <Text className="text-accent text-6xl font-bold mb-4">NULLXES</Text>
        </MotiView>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300, type: "timing", duration: 600 }}
        >
          <Text className="text-text-secondary text-xl">MESSENGER</Text>
        </MotiView>
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 600, type: "timing", duration: 400 }}
          className="mt-8"
        >
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <View className="w-2 h-2 bg-accent rounded-full" />
            <View className="w-2 h-2 bg-accent rounded-full" style={{ opacity: 0.6 }} />
            <View className="w-2 h-2 bg-accent rounded-full" style={{ opacity: 0.3 }} />
          </View>
        </MotiView>
      </Animated.View>
    </View>
  );
}

