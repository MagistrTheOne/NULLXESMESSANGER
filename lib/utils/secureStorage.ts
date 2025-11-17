import * as SecureStore from "expo-secure-store";

const KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_ID: "user_id",
  BIOMETRIC_ENABLED: "biometric_enabled",
} as const;

export async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Error setting secure item ${key}:`, error);
    throw error;
  }
}

export async function getSecureItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Error getting secure item ${key}:`, error);
    return null;
  }
}

export async function deleteSecureItem(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Error deleting secure item ${key}:`, error);
  }
}

export async function setAuthToken(token: string): Promise<void> {
  await setSecureItem(KEYS.AUTH_TOKEN, token);
}

export async function getAuthToken(): Promise<string | null> {
  return await getSecureItem(KEYS.AUTH_TOKEN);
}

export async function deleteAuthToken(): Promise<void> {
  await deleteSecureItem(KEYS.AUTH_TOKEN);
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await setSecureItem(KEYS.BIOMETRIC_ENABLED, enabled ? "true" : "false");
}

export async function isBiometricEnabled(): Promise<boolean> {
  const value = await getSecureItem(KEYS.BIOMETRIC_ENABLED);
  return value === "true";
}

