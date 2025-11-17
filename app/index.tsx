import { useAuthStore } from "@/stores/authStore";
import { Redirect } from "expo-router";

export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Если авторизован, сразу на главный экран
  if (isAuthenticated) {
    return <Redirect href="/(main)/chats" />;
  }

  // Если не авторизован, показываем экран приветствия
  return <Redirect href="/welcome" />;
}

