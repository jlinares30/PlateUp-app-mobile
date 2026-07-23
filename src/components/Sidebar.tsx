import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { COLORS, SPACING, useThemeColors } from "../constants/theme";
import { useSidebar } from "../context/SidebarContext";
import { TranslationKey, useTranslation } from "../lib/i18n";
import { useAuthStore } from "../store/useAuth";

type MenuItem = {
    icon: string;
    labelKey: TranslationKey;
    route: string;
    disabled?: boolean;
};

const MAIN_ITEMS: MenuItem[] = [
    { icon: "home-outline", labelKey: "sidebar.home", route: "/" },
    { icon: "restaurant-outline", labelKey: "sidebar.recipes", route: "/recipes" },
    { icon: "calendar-outline", labelKey: "sidebar.mealPlans", route: "/mealplans" },
    { icon: "cart-outline", labelKey: "sidebar.shoppingList", route: "/shopping" },
];

const INVENTORY_SUB_ITEMS: MenuItem[] = [
    { icon: "nutrition-outline", labelKey: "sidebar.pantry", route: "/pantry" },
    { icon: "search-outline", labelKey: "sidebar.ingredients", route: "/ingredients" },
    { icon: "calculator-outline", labelKey: "sidebar.unitConverter", route: "/converter", disabled: true },
];

const BOTTOM_ITEMS: MenuItem[] = [
    { icon: "person-outline", labelKey: "sidebar.profile", route: "/profile" },
    { icon: "settings-outline", labelKey: "sidebar.settings", route: "/settings" },
];

function Sidebar() {
    const router = useRouter();
    const { toggleSidebar } = useSidebar();
    const { logout } = useAuthStore();
    const { t } = useTranslation();
    const { colors } = useThemeColors();

    const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);

    const handleNavigation = (route: string) => {
        toggleSidebar();

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
        router.replace('/(auth)/login');
    };

    const renderMenuItem = (item: MenuItem, isSubItem: boolean = false) => (
        <TouchableOpacity
            key={item.route}
            style={[
                styles.menuItem,
                isSubItem && styles.subMenuItem,
                item.disabled && { opacity: 0.5 }
            ]}
            onPress={() => {
                if (!item.disabled) {
                    handleNavigation(item.route);
                }
            }}
            disabled={item.disabled}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons
                    name={item.icon as any}
                    size={isSubItem ? 20 : 22}
                    color={COLORS.card}
                    style={styles.icon}
                />
                <Text style={[styles.menuLabel, isSubItem && styles.subMenuLabel]}>
                    {t(item.labelKey)}
                </Text>
                {item.disabled && (
                    <View style={styles.soonBadge}>
                        <Text style={styles.soonText}>{t('sidebar.soon')}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.primary }]}>
            <View style={styles.content}>
                {/* Logo Section */}
                <View style={styles.profileSection}>
                    <Image
                        source={require("@/assets/images/brand.png")}
                        style={styles.logo}
                    />
                </View>

                {/* Menu Items Container */}
                <View style={styles.menuContainer}>
                    {/* Main Menu Items */}
                    {MAIN_ITEMS.map((item) => renderMenuItem(item))}

                    {/* Collapsible Inventory Section */}
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => setIsInventoryOpen(!isInventoryOpen)}
                        activeOpacity={0.7}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <Ionicons name="cube-outline" size={22} color={COLORS.card} style={styles.icon} />
                            <Text style={styles.menuLabel}>{t('sidebar.inventory')}</Text>
                            <Ionicons
                                name={isInventoryOpen ? "chevron-up" : "chevron-down"}
                                size={18}
                                color={COLORS.card}
                                style={{ marginLeft: 'auto', opacity: 0.8 }}
                            />
                        </View>
                    </TouchableOpacity>

                    {/* Submenu Accordion */}
                    {isInventoryOpen && (
                        <Animated.View
                            entering={FadeIn.duration(200)}
                            exiting={FadeOut.duration(150)}
                            layout={Layout.springify()}
                            style={styles.subMenuContainer}
                        >
                            {INVENTORY_SUB_ITEMS.map((subItem) => renderMenuItem(subItem, true))}
                        </Animated.View>
                    )}

                    <View style={styles.divider} />

                    {/* Account & Settings Items */}
                    {BOTTOM_ITEMS.map((item) => renderMenuItem(item))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color={COLORS.card} style={styles.icon} />
                    <Text style={styles.menuLabel}>{t('sidebar.logOut')}</Text>
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
        paddingTop: SPACING.xl * 1.8,
        paddingBottom: SPACING.xl,
        justifyContent: 'space-between',
    },
    profileSection: {
        alignItems: 'flex-start',
        marginTop: SPACING.m,
        marginBottom: SPACING.l,
        paddingVertical: SPACING.xs,
    },
    logo: {
        width: 195,
        height: 46,
        tintColor: COLORS.card
    },
    menuContainer: {
        flex: 1,
        paddingTop: SPACING.s,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.m,
        paddingVertical: 4,
    },
    subMenuItem: {
        paddingLeft: SPACING.s,
        paddingRight: SPACING.s,
        marginBottom: 4,
        marginTop: 2,
    },
    subMenuContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.12)',
        borderRadius: 12,
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.s,
        marginBottom: SPACING.m,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        marginVertical: SPACING.s,
        marginBottom: SPACING.m,
    },
    icon: {
        marginRight: SPACING.m,
        opacity: 0.9,
    },
    menuLabel: {
        color: COLORS.card,
        fontWeight: '600',
        fontSize: 15,
    },
    subMenuLabel: {
        fontSize: 13,
        fontWeight: '500',
        opacity: 0.9,
        flexShrink: 1,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: SPACING.m,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
    },
    soonBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 'auto',
    },
    soonText: {
        color: COLORS.card,
        fontSize: 10,
        fontWeight: 'bold'
    }
});
