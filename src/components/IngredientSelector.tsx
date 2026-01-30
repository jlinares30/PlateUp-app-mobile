import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
import api from "@/src/lib/api";
import { Ingredient } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface IngredientSelectorProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (ingredient: Ingredient) => void;
}

export default function IngredientSelector({
    visible,
    onClose,
    onSelect,
}: IngredientSelectorProps) {
    const [search, setSearch] = useState("");

    const { data: ingredients = [], isLoading } = useQuery({
        queryKey: ["ingredients", search],
        queryFn: async () => {
            const res = await api.get("/ingredients", {
                params: { query: search },
            });
            return res.data;
        },
    });

    const handleSelect = (ingredient: Ingredient) => {
        onSelect(ingredient);
        onClose();
        setSearch("");
    };

    const renderItem = ({ item }: { item: Ingredient }) => (
        <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
            <View style={styles.iconContainer}>
                {/* Placeholder icon, ideally would be item.image if available */}
                <Ionicons name="nutrition-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.unit}>{item.category || "General"}</Text>
            </View>
            <Ionicons name="add-circle-outline" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Select Ingredient</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={COLORS.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Ionicons
                            name="search"
                            size={20}
                            color={COLORS.text.light}
                            style={styles.searchIcon}
                        />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search ingredients..."
                            value={search}
                            onChangeText={setSearch}
                            autoFocus={true}
                        />
                    </View>

                    {isLoading ? (
                        <ActivityIndicator
                            size="large"
                            color={COLORS.primary}
                            style={{ marginTop: SPACING.xl }}
                        />
                    ) : (
                        <FlatList
                            data={ingredients}
                            keyExtractor={(item) => item._id}
                            renderItem={renderItem}
                            contentContainerStyle={styles.list}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No ingredients found</Text>
                            }
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    container: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: SPACING.l,
        borderTopRightRadius: SPACING.l,
        height: "80%",
        padding: SPACING.m,
        ...SHADOWS.large,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.m,
        paddingHorizontal: SPACING.s,
    },
    title: {
        fontSize: FONTS.sizes.h2,
        fontWeight: "700",
        color: COLORS.text.primary,
    },
    closeButton: {
        padding: SPACING.xs,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.card,
        borderRadius: SPACING.m,
        paddingHorizontal: SPACING.m,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.border,
        height: 50,
    },
    searchIcon: {
        marginRight: SPACING.s,
    },
    searchInput: {
        flex: 1,
        fontSize: FONTS.sizes.body,
        color: COLORS.text.primary,
        height: "100%",
    },
    list: {
        paddingBottom: SPACING.xl,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.card,
        padding: SPACING.m,
        borderRadius: SPACING.m,
        marginBottom: SPACING.s,
        ...SHADOWS.small,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.m,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: FONTS.sizes.body,
        fontWeight: "600",
        color: COLORS.text.primary,
    },
    unit: {
        fontSize: FONTS.sizes.small,
        color: COLORS.text.secondary,
    },
    emptyText: {
        textAlign: "center",
        color: COLORS.text.secondary,
        marginTop: SPACING.xl,
        fontSize: FONTS.sizes.body,
    },
});
