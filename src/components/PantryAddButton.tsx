import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";
import { COLORS } from "../constants/theme";

export default function PantryAddButton() {
    const router = useRouter();

    return (
        <TouchableOpacity onPress={() => router.push('/(app)/pantry/add')}>
            <Ionicons name="add" size={28} color={COLORS.text.primary} />
        </TouchableOpacity>
    );
}
