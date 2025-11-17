import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { Colors } from "@/theme/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
}: ButtonProps) {
  const baseStyles = "rounded-xl items-center justify-center";
  const variantStyles = {
    primary: "bg-accent",
    secondary: "bg-secondary border border-accent/30",
    danger: "bg-danger",
  };
  const sizeStyles = {
    sm: "px-4 py-2",
    md: "px-6 py-3",
    lg: "px-8 py-4",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className} ${disabled || loading ? "opacity-50" : ""}`}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" ? Colors.accent : Colors.text.primary} />
      ) : (
        <Text
          className={`font-semibold ${
            size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg"
          } ${variant === "secondary" ? "text-accent" : "text-white"}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

