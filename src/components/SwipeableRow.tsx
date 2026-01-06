import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Dimensions, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const THRESHOLD = SCREEN_WIDTH * 0.3;

interface Props {
    children: React.ReactNode;
    onSwipe: () => void;
    style?: StyleProp<ViewStyle>;
    backColor?: string;
    iconName?: keyof typeof Ionicons.glyphMap;
    actionLabel?: string;
}

export default function SwipeableRow({
    children,
    onSwipe,
    style,
    backColor = '#2ecc71',
    iconName = 'cart',
    actionLabel = 'Agregar'
}: Props) {
    const translateX = useSharedValue(0);
    const [hasVibrated, setHasVibrated] = useState(false);

    const pan = Gesture.Pan()
        .onUpdate((e) => {
            if (e.translationX > 0) {
                translateX.value = e.translationX;

                if (e.translationX > THRESHOLD && !hasVibrated) {
                    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
                    runOnJS(setHasVibrated)(true);
                } else if (e.translationX <= THRESHOLD && hasVibrated) {
                    runOnJS(setHasVibrated)(false);
                }
            }
        })
        .onEnd(() => {
            if (translateX.value > THRESHOLD) {
                runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
                translateX.value = withTiming(SCREEN_WIDTH, { duration: 300 }, () => {
                    runOnJS(onSwipe)();
                    translateX.value = 0;
                    runOnJS(setHasVibrated)(false);
                });
            } else {
                translateX.value = withSpring(0);
                runOnJS(setHasVibrated)(false);
            }
        });

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    const rIconStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            translateX.value,
            [0, THRESHOLD],
            [0.5, 1.2],
            Extrapolation.CLAMP
        );

        const opacity = interpolate(
            translateX.value,
            [0, THRESHOLD / 2, THRESHOLD],
            [0, 0.5, 1],
            Extrapolation.CLAMP
        );

        return {
            transform: [{ scale }],
            opacity,
        };
    });

    return (
        <GestureHandlerRootView style={[styles.container, style]}>
            <View style={[styles.background, { backgroundColor: backColor }]}>
                <Animated.View style={[styles.iconContainer, rIconStyle]}>
                    <Ionicons name={iconName} size={30} color="#fff" />
                    <Text style={styles.addText}>{actionLabel}</Text>
                </Animated.View>
            </View>

            <GestureDetector gesture={pan}>
                <Animated.View style={[{ backgroundColor: 'transparent' }, rStyle]}>
                    {children}
                </Animated.View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        position: 'relative',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 12, // Match typical card usage
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20,
        overflow: 'hidden',
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
        marginLeft: 8,
    },
});
