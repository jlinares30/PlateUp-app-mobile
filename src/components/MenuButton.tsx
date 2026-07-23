import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";
import { COLORS, useThemeColors } from "../constants/theme";
import { useSidebar } from "../context/SidebarContext";

export default function MenuButton() {
    const { toggleSidebar } = useSidebar();
    const { colors } = useThemeColors();

    return (
        <TouchableOpacity onPress={toggleSidebar} style={{ marginRight: 15 }}>
            <Ionicons name="menu" size={32} color={colors.text.primary} />
        </TouchableOpacity>
    );
}
