import { MotiView } from "moti";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

interface SpiderWebPatternProps {
  opacity?: number;
  color?: string;
  animated?: boolean;
}

export function SpiderWebPattern({
  opacity = 0.15,
  color = "#00B7FF",
  animated = true,
}: SpiderWebPatternProps) {
  const webPaths = [
    "M 0,0 L 200,200 M 200,0 L 0,200 M 100,0 L 100,200 M 0,100 L 200,100",
    "M 50,50 L 150,150 M 150,50 L 50,150",
  ];

  const circles = [
    { cx: 100, cy: 100, r: 30 },
    { cx: 100, cy: 100, r: 60 },
    { cx: 100, cy: 100, r: 90 },
  ];

  return (
    <View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      <MotiView
        from={{ rotate: "0deg" }}
        animate={{ rotate: animated ? "360deg" : "0deg" }}
        transition={{
          type: "timing",
          duration: 20000,
          loop: animated,
        }}
        style={{
          position: "absolute",
          top: -height / 2,
          left: -width / 2,
          width: width * 2,
          height: height * 2,
        }}
      >
        <Svg width={width * 2} height={height * 2}>
          <G>
            {circles.map((circle, index) => (
              <Circle
                key={`circle-${index}`}
                cx={circle.cx}
                cy={circle.cy}
                r={circle.r}
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity={0.3}
              />
            ))}
            {webPaths.map((path, index) => (
              <Path
                key={`path-${index}`}
                d={path}
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity={0.2}
              />
            ))}
          </G>
        </Svg>
      </MotiView>
    </View>
  );
}

