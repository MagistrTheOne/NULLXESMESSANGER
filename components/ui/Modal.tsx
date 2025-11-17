import React from "react";
import { Modal as RNModal, View, TouchableOpacity, Text } from "react-native";
import { X } from "phosphor-react-native";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="bg-secondary rounded-2xl w-full max-w-md border border-accent/20">
          {title && (
            <View className="flex-row items-center justify-between p-4 border-b border-accent/10">
              <Text className="text-text-primary text-lg font-bold">{title}</Text>
              <TouchableOpacity onPress={onClose} className="p-1">
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
          <View className="p-4">{children}</View>
        </View>
      </View>
    </RNModal>
  );
}

