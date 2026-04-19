import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export default function ProgressRing({ progress = 0 }) {
  const size = 70;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // ✅ safety
  const safeProgress = isNaN(progress) ? 0 : progress;

  const strokeDashoffset =
    circumference - (circumference * safeProgress) / 100;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        
        {/* Background */}
        <Circle
          stroke="#222"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Progress */}
        <Circle
          stroke="#4caf50"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Percentage */}
      <Text style={styles.progressText}>
        {Math.round(safeProgress)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    position: 'absolute',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});