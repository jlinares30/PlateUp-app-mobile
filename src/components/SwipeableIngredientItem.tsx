import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const THRESHOLD = SCREEN_WIDTH * 0.25;

export interface Ingredient {
  _id: string;
  name: string;
  category?: string;
  unit?: string;
}

type Props = {
  item: Ingredient;
  onPress?: () => void;
  onAdd?: (item: Ingredient) => void;
};

export default function SwipeableIngredientItem({ item, onPress, onAdd }: Props) {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationX > 0) translateX.value = e.translationX;
    })
    .onEnd(() => {
      if (translateX.value > THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 250 }, () => {
          if (onAdd) runOnJS(onAdd)(item);
          translateX.value = withSpring(0);
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [0, THRESHOLD], [1, 0.6]);
    return {
      transform: [{ translateX: translateX.value }],
      opacity,
    };
  });

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.row, animatedStyle]}>
          <TouchableOpacity style={styles.touch} onPress={() => onPress?.()} activeOpacity={0.8}>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.category ?? "Sin categoría"} · {item.unit ?? "unidad"}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eef6fb",
  },
  touch: { flex: 1 },
  info: { flexDirection: "column" },
  name: { fontSize: 16, fontWeight: "600", color: "#2c3e50" },
  meta: { marginTop: 6, color: "#7f8c8d", fontSize: 13 },
});