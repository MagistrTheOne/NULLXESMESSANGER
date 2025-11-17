import React from "react";
import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}

export function Card({ children, className = "", glass = true, ...props }: CardProps) {
  return (
    <View
      {...props}
      className={`rounded-2xl ${glass ? "bg-secondary/60 backdrop-blur-xl" : "bg-secondary"} border border-accent/10 ${className}`}
    >
      {children}
    </View>
  );
}

