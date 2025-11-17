import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

interface FloatingParticlesProps {
  count?: number;
  color?: string;
  opacity?: number;
}

export function FloatingParticles({
  count = 20,
  color = "#00B7FF",
  opacity = 0.4,
}: FloatingParticlesProps) {
  const particles: Particle[] = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 2000,
      duration: 3000 + Math.random() * 2000,
    }));
  }, [count]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((particle) => (
        <ParticleComponent
          key={particle.id}
          particle={particle}
          color={color}
          opacity={opacity}
        />
      ))}
    </View>
  );
}

function ParticleComponent({
  particle,
  color,
  opacity,
}: {
  particle: Particle;
  color: string;
  opacity: number;
}) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      particle.delay,
      withRepeat(
        withTiming(
          -height * 0.3,
          {
            duration: particle.duration,
            easing: Easing.linear,
          }
        ),
        -1,
        false
      )
    );

    translateX.value = withDelay(
      particle.delay,
      withRepeat(
        withTiming(
          (Math.random() - 0.5) * 50,
          {
            duration: particle.duration,
            easing: Easing.inOut(Easing.sin),
          }
        ),
        -1,
        true
      )
    );

    scale.value = withDelay(
      particle.delay,
      withRepeat(
        withTiming(
          [1, 1.2, 1],
          {
            duration: particle.duration / 2,
            easing: Easing.inOut(Easing.sin),
          }
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: color,
          opacity,
        },
        animatedStyle,
      ]}
    />
  );
}

