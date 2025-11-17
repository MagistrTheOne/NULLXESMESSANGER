import * as LocalAuthentication from "expo-local-authentication";

export async function isBiometricAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return false;

  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

export async function authenticateWithBiometric(): Promise<boolean> {
  try {
    const available = await isBiometricAvailable();
    if (!available) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Аутентификация",
      cancelLabel: "Отмена",
      disableDeviceFallback: false,
      fallbackLabel: "Использовать пароль",
    });

    return result.success;
  } catch (error) {
    console.error("Biometric authentication error:", error);
    return false;
  }
}

export async function getSupportedBiometricType(): Promise<string | null> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return "Face ID";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return "Touch ID / Fingerprint";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return "Iris";
    }
    return null;
  } catch (error) {
    console.error("Error getting biometric type:", error);
    return null;
  }
}

