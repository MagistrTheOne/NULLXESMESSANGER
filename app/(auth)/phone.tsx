import { NeonGlow } from "@/components/NeonGlow";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { createUser, getUserByPhone } from "@/lib/api/db";
import { generateVerificationCode, storeVerificationCode } from "@/lib/utils/codeVerification";
import { formatPhone, validatePhone } from "@/lib/utils/validation";
import { useAuthStore } from "@/stores/authStore";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ChatText } from "phosphor-react-native";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Linking, Platform, Text, TouchableOpacity, View } from "react-native";

export default function PhoneScreen() {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleContinue = async () => {
    setError("");
    
    if (activeTab === "signin") {
      if (!validatePhone(phone)) {
        setError("Введите корректный номер телефона");
        return;
      }
    } else {
      if (!username.trim()) {
        setError("Введите имя пользователя");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setError("Введите корректный email");
        return;
      }
      if (!password.trim() || password.length < 6) {
        setError("Пароль должен содержать минимум 6 символов");
        return;
      }
    }

    setLoading(true);
    try {
      if (activeTab === "signin") {
        const formattedPhone = formatPhone(phone);
        let user = await getUserByPhone(formattedPhone);
        
        if (!user) {
          user = await createUser(formattedPhone);
        }

        const verificationCode = generateVerificationCode();
        await storeVerificationCode(formattedPhone, verificationCode);

        setUser({
          id: user.id,
          phone: user.phone,
          name: user.name || undefined,
          avatar: user.avatar || undefined,
          status: user.status || undefined,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        Alert.alert(
          "Код отправлен",
          `Код подтверждения: ${verificationCode}\n\n(В продакшене код будет отправлен через SMS)`,
          [{ text: "OK", onPress: () => router.push("/(auth)/verify") }]
        );
      } else {
        // Sign Up logic
        const formattedPhone = phone.trim() || `user_${Date.now()}`;
        const user = await createUser(formattedPhone);
        
        // TODO: Update user with username, email, password hash
        
        const verificationCode = generateVerificationCode();
        await storeVerificationCode(formattedPhone, verificationCode);

        setUser({
          id: user.id,
          phone: user.phone,
          name: username,
          avatar: user.avatar || undefined,
          status: user.status || undefined,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        Alert.alert(
          "Код отправлен",
          `Код подтверждения: ${verificationCode}\n\n(В продакшене код будет отправлен через SMS)`,
          [{ text: "OK", onPress: () => router.push("/(auth)/verify") }]
        );
      }
    } catch (err) {
      setError(activeTab === "signin" ? "Ошибка при входе. Попробуйте снова." : "Ошибка при регистрации. Попробуйте снова.");
      console.error(err);
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
      <View className="flex-1 items-center justify-center px-6">
        {/* App Icon and Branding */}
        <View className="items-center mb-8">
          <NeonGlow color="blue" intensity="medium" animated>
            <View className="bg-secondary/60 rounded-full p-4 border border-accent/30">
              <ChatText size={48} color="#00B7FF" weight="fill" />
            </View>
          </NeonGlow>
          <NeonGlow color="blue" intensity="low" animated>
            <Text className="text-accent text-4xl font-bold mt-4 mb-2" style={{ textShadowColor: "#00B7FF", textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}>
              NULLXES Messenger
            </Text>
          </NeonGlow>
          <Text className="text-text-secondary text-base">
            Connect with friends in real-time
          </Text>
        </View>

        {/* Form Card */}
        <Card className="w-full max-w-sm p-6">
          {/* Tabs */}
          <View className="flex-row mb-6 bg-secondary/40 rounded-xl p-1">
            <TouchableOpacity
              onPress={() => {
                setActiveTab("signin");
                setError("");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className={`flex-1 py-3 rounded-lg ${activeTab === "signin" ? "bg-accent" : ""}`}
            >
              <Text className={`text-center font-semibold ${activeTab === "signin" ? "text-white" : "text-text-secondary"}`}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setActiveTab("signup");
                setError("");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className={`flex-1 py-3 rounded-lg ${activeTab === "signup" ? "bg-accent" : ""}`}
            >
              <Text className={`text-center font-semibold ${activeTab === "signup" ? "text-white" : "text-text-secondary"}`}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          {activeTab === "signin" ? (
            <Input
              label="Номер телефона"
              placeholder="+7 (999) 123-45-67"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              error={error}
              autoFocus
            />
          ) : (
            <>
              <Input
                label="Username"
                placeholder="johndoe"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                error={error && !username.trim() ? error : undefined}
                autoFocus
              />
              <Input
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={error && username.trim() && !email.includes("@") ? error : undefined}
              />
              <Input
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={error && username.trim() && email.includes("@") && password.length < 6 ? error : undefined}
              />
            </>
          )}

          {error && activeTab === "signin" && (
            <Text className="text-danger text-sm mt-2">{error}</Text>
          )}

          {/* Action Button */}
          <Button
            title={activeTab === "signin" ? "Continue" : "Create Account"}
            onPress={handleContinue}
            loading={loading}
            disabled={activeTab === "signin" ? !phone : !username || !email || !password}
            className="mt-4"
            size="lg"
          />
        </Card>

        {/* Terms and Privacy */}
        <View className="mt-6 px-6">
          <Text className="text-text-muted text-xs text-center">
            By continuing, you agree to our{" "}
            <Text
              className="text-accent"
              onPress={() => Linking.openURL("https://nullxes.com/terms")}
            >
              Terms of Service
            </Text>
            {" "}and{" "}
            <Text
              className="text-accent"
              onPress={() => Linking.openURL("https://nullxes.com/privacy")}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

