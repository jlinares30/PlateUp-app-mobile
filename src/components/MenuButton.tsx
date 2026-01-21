import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";
import { COLORS } from "../constants/theme";
import { useSidebar } from "../context/SidebarContext";

export default function MenuButton() {
    const { toggleSidebar } = useSidebar();

    return (
        <TouchableOpacity onPress={toggleSidebar} style={{ marginRight: 15 }}>
            <Ionicons name="menu" size={40} color={COLORS.text.primary} />
        </TouchableOpacity>
    );
}
