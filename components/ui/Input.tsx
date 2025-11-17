import React from "react";
import { TextInput, View, Text, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-text-secondary text-sm mb-2 font-medium">{label}</Text>
      )}
      <TextInput
        {...props}
        className={`bg-secondary/60 border border-accent/20 rounded-xl px-4 py-3 text-text-primary text-base ${
          error ? "border-danger" : ""
        }`}
        placeholderTextColor="#6B7280"
      />
      {error && <Text className="text-danger text-sm mt-1">{error}</Text>}
    </View>
  );
}

