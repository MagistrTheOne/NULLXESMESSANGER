import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";

export async function pickImageFromGallery(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== "granted") {
    Alert.alert("Permission denied", "We need permission to access your photos");
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0].uri;
}

export async function takePhotoWithCamera(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  
  if (status !== "granted") {
    Alert.alert("Permission denied", "We need permission to access your camera");
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (result.canceled) {
    return null;
  }

  return result.assets[0].uri;
}

export async function showImagePickerOptions(): Promise<string | null> {
  return new Promise((resolve) => {
    Alert.alert(
      "Select Image",
      "Choose an option",
      [
        {
          text: "Camera",
          onPress: async () => {
            const uri = await takePhotoWithCamera();
            resolve(uri);
          },
        },
        {
          text: "Gallery",
          onPress: async () => {
            const uri = await pickImageFromGallery();
            resolve(uri);
          },
        },
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true }
    );
  });
}

