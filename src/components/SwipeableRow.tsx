import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Dimensions, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    useAnimatedReaction,
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
    shouldAnimate?: boolean;
}

export default function SwipeableRow({
    children,
    onSwipe,
    style,
    backColor = '#2ecc71',
    iconName = 'cart',
    actionLabel = 'Agregar',
    shouldAnimate = false
}: Props) {
    const translateX = useSharedValue(0);
    const hasVibrated = useSharedValue(false); // Use shared value for logic

    // Programmatic animation for onboarding
    React.useEffect(() => {
        if (shouldAnimate) {
            // Wait a bit for layout
            const timeout = setTimeout(() => {
                translateX.value = withTiming(80, { duration: 600 }, () => {
                    translateX.value = withTiming(0, { duration: 600 });
                });
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [shouldAnimate]);

    // Move side effects to reaction
    useAnimatedReaction(
        () => translateX.value > THRESHOLD,
        (isTriggered: boolean, previous: boolean | null) => {
            if (isTriggered && !previous) {
                runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
                hasVibrated.value = true;
            } else if (!isTriggered && previous) {
                hasVibrated.value = false;
            }
        }
    );

    const pan = Gesture.Pan()
        .activeOffsetX([-20, 20])
        .failOffsetY([-5, 5])
        .onUpdate((e) => {
            if (e.translationX > 0) {
                translateX.value = e.translationX;
            }
        })
        .onEnd(() => {
            if (translateX.value > THRESHOLD) {
                runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
                translateX.value = withTiming(SCREEN_WIDTH, { duration: 300 }, () => {
                    runOnJS(onSwipe)();
                    translateX.value = 0;
                    hasVibrated.value = false;
                });
            } else {
                translateX.value = withSpring(0);
                hasVibrated.value = false;
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
