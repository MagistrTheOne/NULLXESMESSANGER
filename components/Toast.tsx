import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MotiView } from "moti";
import { CheckCircle, X, XCircle, Info, AlertCircle } from "phosphor-react-native";
import { NeonGlow } from "./NeonGlow";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "info",
  visible,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={24} color="#00FF00" weight="fill" />;
      case "error":
        return <XCircle size={24} color="#FF1A4B" weight="fill" />;
      case "warning":
        return <AlertCircle size={24} color="#FFA500" weight="fill" />;
      default:
        return <Info size={24} color="#00B7FF" weight="fill" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case "success":
        return "green";
      case "error":
        return "danger";
      case "warning":
        return "orange";
      default:
        return "blue";
    }
  };

  return (
    <MotiView
      from={{ translateY: -100, opacity: 0 }}
      animate={{ translateY: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
      transition={{ type: "timing", duration: 300 }}
      className="absolute top-12 left-4 right-4 z-50"
    >
      <NeonGlow color={getColor() as any} intensity="medium">
        <View
          className={`p-4 rounded-xl flex-row items-center ${
            type === "success"
              ? "bg-green-500/20 border border-green-500/50"
              : type === "error"
              ? "bg-danger/20 border border-danger/50"
              : type === "warning"
              ? "bg-orange-500/20 border border-orange-500/50"
              : "bg-accent/20 border border-accent/50"
          }`}
        >
          {getIcon()}
          <Text className="text-text-primary flex-1 ml-3 font-semibold">{message}</Text>
          <TouchableOpacity onPress={onClose} className="ml-2">
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </NeonGlow>
    </MotiView>
  );
}

