import React from "react";
import { TextInput, View, Text, TextInputProps, TouchableOpacity } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
  rightIcon?: React.ReactNode;
}

export function Input({ label, error, className = "", rightIcon, ...props }: InputProps) {
  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-text-secondary text-sm mb-2 font-medium">{label}</Text>
      )}
      <View className="relative">
        <TextInput
          {...props}
          className={`bg-secondary/60 border border-accent/20 rounded-xl px-4 py-3 text-text-primary text-base ${
            error ? "border-danger" : ""
          } ${rightIcon ? "pr-12" : ""}`}
          placeholderTextColor="#6B7280"
        />
        {rightIcon && (
          <View className="absolute right-0 top-0 bottom-0 justify-center pr-3">
            {rightIcon}
          </View>
        )}
      </View>
      {error && <Text className="text-danger text-sm mt-1">{error}</Text>}
    </View>
  );
}


        )}
      </View>
      {error && <Text className="text-danger text-sm mt-1">{error}</Text>}
    </View>
  );
}

