import React from "react";
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle
} from "react-native-reanimated";
import { COLORS } from "../constants/theme";
import { useSidebar } from "../context/SidebarContext";
import Sidebar from "./Sidebar";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
    const { progress, isOpen, toggleSidebar } = useSidebar();

    const animatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(progress.value, [0, 1], [1, 0.8], Extrapolation.CLAMP);
        const borderRadius = interpolate(progress.value, [0, 1], [0, 30], Extrapolation.CLAMP);
        const translateX = interpolate(progress.value, [0, 1], [0, SCREEN_WIDTH * 0.6], Extrapolation.CLAMP);
        const rotateY = interpolate(progress.value, [0, 1], [0, -10], Extrapolation.CLAMP);

        return {
            transform: [
                { perspective: 1000 },
                { scale },
                { translateX },
                { rotateY: `${rotateY}deg` }
            ],
            borderRadius,
            overflow: 'hidden',
        };
    });

    const sidebarStyle = useAnimatedStyle(() => {
        const opacity = interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP);
        const scale = interpolate(progress.value, [0, 1], [0.9, 1], Extrapolation.CLAMP);
        return {
            opacity,
            transform: [{ scale }]
        }
    })

    // Close on tap when open
    const tap = Gesture.Tap().onEnd(() => {
        if (isOpen) {
            // need to run on JS thread to trigger context update
            // but we can just simplify and pass a callback if needed
            // For now, relies on wrapper
        }
    });

    return (
        <View style={styles.container}>
            {/* 1. Main Content PRIMERO (estará al fondo visualmente cuando el sidebar suba) */}
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Animated.View
                    style={[styles.mainContent, animatedStyle]}
                    pointerEvents={isOpen ? 'none' : 'auto'} // 'none' hace que los clics ignoren esta capa totalmente
                >
                    {children}
                </Animated.View>
            </GestureHandlerRootView>

            {/* 2. Sidebar DESPUÉS (con zIndex dinámico para recibir clics al frente) */}
            <Animated.View
                style={[
                    styles.sidebarContainer,
                    sidebarStyle,
                    {
                        zIndex: isOpen ? 2 : 0,
                        pointerEvents: isOpen ? 'box-none' : 'none',
                        flexDirection: 'row' // Para que el sidebar y el overlay vivan lado a lado
                    }
                ]}
            >
                {/* El contenido del Sidebar ocupa el 70% */}
                <View style={{ width: SCREEN_WIDTH * 0.55 }}>
                    <Sidebar />
                </View>

                {/* 3. Overlay a la derecha (30%) para cerrar al tocar el área vacía */}
                {isOpen && (
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={toggleSidebar}
                        activeOpacity={1}
                    >
                        <View style={{ flex: 1 }} />
                    </TouchableOpacity>
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary, // Background color behind the main screen
    },
    sidebarContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    sidebarContent: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
        backgroundColor: COLORS.background,
        zIndex: 1,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: -10, height: 0 }, // Shadow to the left
                shadowOpacity: 0.3,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            }
        })
    },
});
