import React, { useEffect } from "react";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRouter, useSegments } from "expo-router";
import { DrawerMenu } from "@/components/DrawerMenu";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";

export default function MainLayout() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const drawerOpen = useUIStore((state) => state.drawerOpen);
  const setDrawerOpen = useUIStore((state) => state.setDrawerOpen);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/phone");
    }
  }, [isAuthenticated]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={() => <DrawerMenu />}
        screenOptions={{
          drawerType: "slide",
          drawerStyle: {
            backgroundColor: "#090D12",
            width: 280,
          },
          overlayColor: "rgba(0, 0, 0, 0.5)",
          headerShown: false,
        }}
        open={drawerOpen}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
      >
        <Drawer.Screen name="chats" options={{ drawerLabel: "Чаты" }} />
        <Drawer.Screen name="chat/[id]" options={{ drawerItemStyle: { display: "none" } }} />
        <Drawer.Screen name="anna" options={{ drawerLabel: "Anna" }} />
        <Drawer.Screen name="profile" options={{ drawerLabel: "Профиль" }} />
        <Drawer.Screen name="settings" options={{ drawerLabel: "Настройки" }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}

