// File upload utility for CDN/Server
// Handles uploading Anna.jpg and other files

import * as FileSystem from "expo-file-system";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "";

/**
 * Upload file to backend/CDN
 * Returns public URL of uploaded file
 */
export async function uploadFileToCDN(
  fileUri: string,
  fileName: string = "anna.jpg",
  fileType: string = "image/jpeg"
): Promise<string> {
  if (!BACKEND_URL) {
    throw new Error("Backend URL not configured. Set EXPO_PUBLIC_BACKEND_URL in .env");
  }

  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Upload to backend
    const response = await fetch(`${BACKEND_URL}/api/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName,
        fileType,
        data: base64,
      }),
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url; // Public CDN URL
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

/**
 * Upload Anna.jpg to CDN
 */
export async function uploadAnnaImage(): Promise<string> {
  // Anna.jpg is in the app bundle, we need to get its URI
  // For now, this is a placeholder - you'll need to implement
  // actual upload logic based on your backend/CDN setup
  
  // Option 1: If you have a backend endpoint
  // const annaImageUri = require("@/app/(main)/anna/image/Anna.jpg");
  // return await uploadFileToCDN(annaImageUri, "anna.jpg", "image/jpeg");
  
  // Option 2: Use a public image hosting service temporarily
  // For production, implement proper CDN upload
  
  throw new Error(
    "Anna.jpg upload not implemented. " +
    "Please upload Anna.jpg to your CDN manually and use setAnnaImageUrl()"
  );
}

