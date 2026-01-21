import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, FONTS, SPACING } from "../constants/theme";
import { useSidebar } from "../context/SidebarContext";
import { useAuthStore } from "../store/useAuth";

const MENU_ITEMS = [
    { icon: "home-outline", label: "Home", route: "/" },
    { icon: "restaurant-outline", label: "Recipes", route: "/recipes" },
    { icon: "calendar-outline", label: "Meal Plans", route: "/mealplans" },
    { icon: "cart-outline", label: "Shopping List", route: "/shopping" },
    { icon: "nutrition-outline", label: "Pantry", route: "/pantry" },
    { icon: "person-outline", label: "Profile", route: "/profile" },
] as const;

function Sidebar() {
    const router = useRouter();
    const { toggleSidebar } = useSidebar();
    const { user, logout } = useAuthStore();

    const handleNavigation = (route: string) => {
        toggleSidebar();

        // Prioritize the closing animation before triggering navigation
        requestAnimationFrame(() => {
            if (route === "/") {
                router.replace("/");
            } else {
                router.push(route as any);
            }
        });
    };

    const handleLogout = () => {
        toggleSidebar();
        logout();
        console.log("Logout");
        router.replace('/(auth)/login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* User Profile */}
                <View style={styles.profileSection}>
                    <Image
                        source={{ uri: "https://i.pravatar.cc/300" }}
                        style={styles.avatar}
                    />
                    <View>
                        <Text style={styles.userName}>{user?.name || "Guest"}</Text>
                        <Text style={styles.userRole}>Premium Chef</Text>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    {MENU_ITEMS.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={() => {
                                handleNavigation(item.route);
                            }}
                        >
                            <Ionicons name={item.icon as any} size={24} color={COLORS.card} style={styles.icon} />
                            <Text style={styles.menuLabel}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color={COLORS.card} style={styles.icon} />
                    <Text style={styles.menuLabel}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

export default React.memo(Sidebar);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.xl * 2,
        justifyContent: 'space-between',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: COLORS.card,
        marginRight: SPACING.m,
    },
    userName: {
        fontSize: FONTS.sizes.h3,
        fontWeight: '700',
        color: COLORS.card,
    },
    userRole: {
        fontSize: FONTS.sizes.small,
        color: 'rgba(255,255,255,0.7)',
    },
    menuContainer: {
        flex: 1,
        paddingTop: SPACING.l,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.l,
        paddingVertical: SPACING.s,
    },
    icon: {
        marginRight: SPACING.m,
        opacity: 0.9,
    },
    menuLabel: {
        color: COLORS.card,
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: SPACING.l,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
    }
});
