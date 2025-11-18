// Utility for Anna.jpg image
// Handles local asset and CDN URL for Digital Human


let annaImageUrl: string | null = null;

/**
 * Get Anna.jpg URL
 * Returns local asset URI or CDN URL if available
 * 
 * Note: For ZEGOCLOUD Digital Human, you need a publicly accessible URL.
 * In production, upload Anna.jpg to your CDN and set the URL using setAnnaImageUrl()
 */
export async function getAnnaImageUrl(): Promise<string> {
  // If we have a cached CDN URL, return it
  if (annaImageUrl && annaImageUrl.startsWith("http")) {
    return annaImageUrl;
  }

  // Try to upload if backend is configured (optional)
  // Uncomment when backend upload is ready
  // try {
  //   const uploadedUrl = await uploadAnnaImageToCDN();
  //   if (uploadedUrl) {
  //     annaImageUrl = uploadedUrl;
  //     return uploadedUrl;
  //   }
  // } catch (error) {
  //   console.warn("Failed to upload Anna.jpg, using fallback:", error);
  // }

  // Fallback: Use a temporary public URL or throw error
  // For production, you MUST upload Anna.jpg to CDN
  throw new Error(
    "Anna.jpg URL not set. Please upload Anna.jpg to your CDN and call setAnnaImageUrl() with the public URL. " +
    "Or configure EXPO_PUBLIC_BACKEND_URL to enable automatic upload."
  );
}

/**
 * Set Anna image URL (for CDN)
 * Call this when you upload Anna.jpg to your CDN
 */
export function setAnnaImageUrl(url: string): void {
  annaImageUrl = url;
}

/**
 * Upload Anna.jpg to CDN via backend
 * Requires EXPO_PUBLIC_BACKEND_URL to be set
 */
export async function uploadAnnaImageToCDN(): Promise<string> {
  try {
    // Get Anna.jpg from app bundle
    // Note: In React Native, we need to use require() for bundled assets
    // For now, this is a placeholder - actual implementation depends on your setup
    
    // Option 1: If Anna.jpg is accessible as a file URI
    // const annaImageUri = require("@/app/(main)/anna/image/Anna.jpg");
    // return await uploadFileToCDN(annaImageUri, "anna.jpg", "image/jpeg");
    
    // Option 2: Use backend upload endpoint
    const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    if (!BACKEND_URL) {
      throw new Error("Backend URL not configured");
    }

    // For now, return empty - implement based on your backend
    // The backend should handle the actual file upload to CDN
    throw new Error("Automatic upload not implemented. Please upload Anna.jpg manually to your CDN.");
  } catch (error) {
    console.error("Error uploading Anna.jpg:", error);
    throw error;
  }
}

/**
 * Get cached Anna image URL (if set)
 */
export function getCachedAnnaImageUrl(): string | null {
  return annaImageUrl;
}
