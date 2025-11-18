// ZEGOCLOUD Configuration
// Centralized config for all ZEGOCLOUD UI Kits

import Constants from "expo-constants";

export const ZEGO_CONFIG = {
  appID: parseInt(process.env.EXPO_PUBLIC_ZEGO_APP_ID || "0"),
  appSign: process.env.EXPO_PUBLIC_ZEGO_APP_SIGN || "",
  serverSecret: process.env.EXPO_PUBLIC_ZEGO_SERVER_SECRET || "", // Only for backend
};

/**
 * Get ZEGO credentials for UI Kits
 */
export function getZegoCredentials() {
  if (!ZEGO_CONFIG.appID || !ZEGO_CONFIG.appSign) {
    throw new Error("ZEGO credentials not configured. Check EXPO_PUBLIC_ZEGO_APP_ID and EXPO_PUBLIC_ZEGO_APP_SIGN in .env");
  }

  return {
    appID: ZEGO_CONFIG.appID,
    appSign: ZEGO_CONFIG.appSign,
  };
}

/**
 * Generate token via backend (for production)
 */
export async function getZegoToken(userID: string, roomID: string): Promise<string> {
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
  
  if (BACKEND_URL) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/zego/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userID, roomId: roomID }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.token || "";
      }
    } catch (error) {
      console.warn("Failed to get token from backend:", error);
    }
  }

  // Fallback: empty token (works in test mode)
  return "";
}

