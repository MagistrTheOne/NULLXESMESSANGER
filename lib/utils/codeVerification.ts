import { getSecureItem, setSecureItem } from "./secureStorage";

const CODE_STORAGE_KEY = "verification_code";
const CODE_EXPIRY_KEY = "verification_code_expiry";
const CODE_PHONE_KEY = "verification_code_phone";

const CODE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

export function generateVerificationCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function storeVerificationCode(phone: string, code: string): Promise<void> {
  const expiry = Date.now() + CODE_EXPIRY_TIME;
  await setSecureItem(CODE_STORAGE_KEY, code);
  await setSecureItem(CODE_EXPIRY_KEY, expiry.toString());
  await setSecureItem(CODE_PHONE_KEY, phone);
}

export async function verifyCode(phone: string, code: string): Promise<boolean> {
  const storedCode = await getSecureItem(CODE_STORAGE_KEY);
  const storedExpiry = await getSecureItem(CODE_EXPIRY_KEY);
  const storedPhone = await getSecureItem(CODE_PHONE_KEY);

  if (!storedCode || !storedExpiry || !storedPhone) {
    return false;
  }

  if (storedPhone !== phone) {
    return false;
  }

  const expiry = parseInt(storedExpiry, 10);
  if (Date.now() > expiry) {
    return false;
  }

  return storedCode === code;
}

export async function clearVerificationCode(): Promise<void> {
  await setSecureItem(CODE_STORAGE_KEY, "");
  await setSecureItem(CODE_EXPIRY_KEY, "");
  await setSecureItem(CODE_PHONE_KEY, "");
}

