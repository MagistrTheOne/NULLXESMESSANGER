import React, { Component, ReactNode } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { AlertTriangle } from "phosphor-react-native";
import { NeonGlow } from "./NeonGlow";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 bg-primary items-center justify-center p-6">
          <NeonGlow color="danger" intensity="medium" animated>
            <View className="items-center">
              <AlertTriangle size={64} color="#FF1A4B" weight="fill" />
              <Text className="text-text-primary text-xl font-bold mt-4 mb-2">
                Произошла ошибка
              </Text>
              <Text className="text-text-secondary text-sm text-center mb-6">
                {this.state.error?.message || "Неизвестная ошибка"}
              </Text>
              <TouchableOpacity
                onPress={this.handleReset}
                className="bg-accent px-6 py-3 rounded-full"
              >
                <Text className="text-white font-semibold">Попробовать снова</Text>
              </TouchableOpacity>
            </View>
          </NeonGlow>
        </View>
      );
    }

    return this.props.children;
  }
}

